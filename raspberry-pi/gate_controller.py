"""
AMW SecureX - Raspberry Pi 5 Gate Controller

Listens to the Firestore "GateCommands" collection. When the guard's website
scans a QR code it writes a command; this script carries it out:

    OPEN_GATE      -> green LED on, servo opens the gate, waits, closes it
    ACCESS_DENIED  -> red LED blinks, gate stays closed

Every command moves through these states, so nothing can ever fire twice:
    PENDING -> PROCESSING -> EXECUTED   (or EXPIRED / FAILED / IGNORED)

BEFORE RUNNING
  1. Run hardware_test.py first and confirm LEDs + servo work.
  2. Put your Firebase service-account key next to this file as
     serviceAccountKey.json  (NEVER commit it to GitHub).
"""

import os
import queue
import logging
from datetime import datetime, timezone

import time

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from gpiozero import LED, AngularServo

# ============================ CONFIGURATION ============================

SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json"
)
GATE_ID = "MAIN_GATE"            # must match GATE_ID in lib/gateService.js

# BCM GPIO numbers (NOT physical pin numbers)
GREEN_LED_PIN = 17               # physical pin 11
RED_LED_PIN = 27                 # physical pin 13
SERVO_PIN = 18                   # physical pin 12

SERVO_CLOSED_ANGLE = 0
SERVO_OPEN_ANGLE = 90
SERVO_MIN_PULSE = 0.0005         # SG90 / MG90S typical range
SERVO_MAX_PULSE = 0.0024

GATE_OPEN_SECONDS = 5            # how long the gate stays open
SERVO_TRAVEL_SECONDS = 0.7       # time allowed for the servo to reach its angle
DENIED_BLINK_SECONDS = 3         # how long the red LED blinks

# A command older than this is considered stale (e.g. Pi was offline) and is
# discarded instead of opening the gate for someone who scanned long ago.
MAX_COMMAND_AGE_SECONDS = 30

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger("gate_controller")


# ============================== HARDWARE ===============================

class GateHardware:
    """Wraps the two LEDs and the servo behind simple, named actions."""

    def __init__(self):
        self.green = LED(GREEN_LED_PIN)
        self.red = LED(RED_LED_PIN)
        self.servo = AngularServo(
            SERVO_PIN,
            initial_angle=SERVO_CLOSED_ANGLE,
            min_angle=0,
            max_angle=180,
            min_pulse_width=SERVO_MIN_PULSE,
            max_pulse_width=SERVO_MAX_PULSE,
        )
        time.sleep(SERVO_TRAVEL_SECONDS)
        self.servo.angle = None  # stop pulses while idle (no buzzing)

    def open_gate(self):
        """Green LED on, swing the gate open, hold, then close."""
        self.green.on()
        self.servo.angle = SERVO_OPEN_ANGLE
        time.sleep(GATE_OPEN_SECONDS)
        self.servo.angle = SERVO_CLOSED_ANGLE
        time.sleep(SERVO_TRAVEL_SECONDS)
        self.servo.angle = None
        self.green.off()

    def deny(self):
        """Blink the red LED. The gate (servo) is never touched."""
        blinks = max(1, int(DENIED_BLINK_SECONDS / 0.5))
        self.red.blink(on_time=0.25, off_time=0.25, n=blinks, background=False)
        self.red.off()

    def shutdown(self):
        self.green.off()
        self.red.off()
        self.servo.angle = None
        self.servo.close()
        self.green.close()
        self.red.close()


# ========================= COMMAND PROCESSING ==========================

def process_command(gate, ref, data):
    """Carry out one command and record its outcome in Firestore."""
    command = data.get("command")
    visitor = data.get("visitorName", "unknown")

    # --- Reject stale commands ---
    timestamp = data.get("timestamp")
    if timestamp is not None:
        age = (datetime.now(timezone.utc) - timestamp).total_seconds()
        if age > MAX_COMMAND_AGE_SECONDS:
            log.warning("Expired command %s (%.0fs old) - not executing", command, age)
            ref.update({"status": "EXPIRED", "processedAt": firestore.SERVER_TIMESTAMP})
            return

    # --- Claim it first (fail-safe: if we crash mid-action it never repeats) ---
    ref.update({"status": "PROCESSING"})

    try:
        if command == "OPEN_GATE":
            log.info("ACCESS GRANTED for %s - opening gate", visitor)
            gate.open_gate()
        elif command == "ACCESS_DENIED":
            log.info("ACCESS DENIED (%s) - red LED", data.get("reason", "no reason given"))
            gate.deny()
        else:
            log.warning("Unknown command %r - ignoring", command)
            ref.update({"status": "IGNORED", "processedAt": firestore.SERVER_TIMESTAMP})
            return

        ref.update({"status": "EXECUTED", "executedAt": firestore.SERVER_TIMESTAMP})
        log.info("Command done.")
    except Exception as error:  # hardware problem, etc.
        log.exception("Command failed")
        ref.update({"status": "FAILED", "error": str(error)})


# ============================== MAIN LOOP ==============================

def main():
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    gate = GateHardware()
    pending = queue.Queue()   # hardware actions run one at a time, in order
    seen_ids = set()

    def on_snapshot(col_snapshot, changes, read_time):
        # Runs on a background thread. Keep it tiny: just queue the work.
        for change in changes:
            if change.type.name != "ADDED":
                continue
            doc = change.document
            if doc.id in seen_ids:
                continue
            seen_ids.add(doc.id)
            pending.put((doc.reference, doc.to_dict()))

    query = (
        db.collection("GateCommands")
        .where(filter=FieldFilter("status", "==", "PENDING"))
        .where(filter=FieldFilter("gateId", "==", GATE_ID))
    )
    watch = query.on_snapshot(on_snapshot)

    log.info("Gate controller running for %s. Waiting for scans... (Ctrl+C to stop)", GATE_ID)

    try:
        while True:
            try:
                ref, data = pending.get(timeout=1)
            except queue.Empty:
                continue
            process_command(gate, ref, data)
    except KeyboardInterrupt:
        log.info("Shutting down.")
    finally:
        watch.unsubscribe()
        gate.shutdown()


if __name__ == "__main__":
    main()
