import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Must match GATE_ID in raspberry-pi/gate_controller.py
export const GATE_ID = "MAIN_GATE";

/**
 * Queue a command for the Raspberry Pi gate controller.
 *
 *   command: "OPEN_GATE"      -> Pi lights green LED and opens the servo gate
 *            "ACCESS_DENIED"  -> Pi blinks the red LED, gate stays shut
 *
 * The Pi watches for documents with status "PENDING", carries them out,
 * then marks them EXECUTED. Returns true if the command was queued.
 * It never throws: a hardware-signal problem must not break the scan screen.
 */
export async function sendGateCommand(command, details = {}) {
  try {
    await addDoc(collection(db, "GateCommands"), {
      command,
      gateId: GATE_ID,
      ...details,
      timestamp: serverTimestamp(),
      status: "PENDING",
    });
    return true;
  } catch (error) {
    console.error("Could not queue gate command:", error);
    return false;
  }
}
