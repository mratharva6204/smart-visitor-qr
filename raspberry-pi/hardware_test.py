"""
AMW SecureX - Hardware wiring test (Raspberry Pi 5)

Run this FIRST, before the gate controller. It proves your LEDs and servo
are wired correctly using no internet and no Firebase, so if something
doesn't work later you already know the hardware is fine.

    python3 hardware_test.py

Expected: green LED blinks 3 times, red LED blinks 3 times,
then the servo swings to 90 degrees, waits, and returns to 0.
"""

import time
from gpiozero import LED, AngularServo

# ---- Must match gate_controller.py ----
GREEN_LED_PIN = 17   # physical pin 11
RED_LED_PIN = 27     # physical pin 13
SERVO_PIN = 18       # physical pin 12

green = LED(GREEN_LED_PIN)
red = LED(RED_LED_PIN)
servo = AngularServo(
    SERVO_PIN,
    initial_angle=0,
    min_angle=0,
    max_angle=180,
    min_pulse_width=0.0005,
    max_pulse_width=0.0024,
)

try:
    print("Green LED: 3 blinks")
    green.blink(on_time=0.4, off_time=0.4, n=3, background=False)

    print("Red LED: 3 blinks")
    red.blink(on_time=0.4, off_time=0.4, n=3, background=False)

    print("Servo: 0 -> 90 -> 0")
    servo.angle = 0
    time.sleep(1)
    servo.angle = 90
    time.sleep(2)
    servo.angle = 0
    time.sleep(1)

    print("Done. If everything moved/lit as expected, wiring is correct.")
finally:
    servo.angle = None   # stop sending pulses so the servo doesn't buzz
    green.off()
    red.off()
    servo.close()
    green.close()
    red.close()
