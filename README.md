# AMW SecureX - Smart Visitor & Parking Management

AMW SecureX is a secure, auditable, and user-friendly digital visitor access management platform for housing societies. It provides role-based web portals for residents, guards, and admins, integrated with a physical hardware gate controller.

## Features Completed to Date

### 1. Digital Visitor Passes & QR Codes
- **Resident Portal:** Residents can generate digital visitor passes with details like name, date, time window, and vehicle number.
- **WhatsApp Integration:** Passes can be shared directly via WhatsApp. The shared links automatically generate a rich **OpenGraph preview card** displaying a boarding-pass style PNG image with the visitor's details and QR code.
- **Scannable QR Codes:** QR codes encode the full public pass URL, meaning they can be scanned by both the proprietary Guard Scanner and any generic smartphone camera.

### 2. Guard Entry & Exit Scanners
- **In-App QR Scanner:** Web-based QR scanner for the security guards to verify entry and exit.
- **Verification Logic:** Prevents duplicate entries, verifies active time windows, and calculates visit durations upon exit.
- **URL Parsing:** The scanner intelligently extracts pass IDs whether the QR contains a raw ID or a full URL link.

### 3. Hardware Integration (Raspberry Pi Gate Controller)
- **Real-Time Actuation:** When a guard successfully scans an entry pass, the web app writes a command to Firebase. A Raspberry Pi detects this in milliseconds and opens a physical gate.
- **Physical Feedback:** Uses a Servo Motor for the gate barrier and Red/Green LEDs for visual access granted/denied indicators.

## Tech Stack
- **Frontend/Backend:** Next.js 16 (App Router), React, Tailwind CSS
- **Database & Auth:** Firebase Authentication, Cloud Firestore
- **Hardware Controller:** Raspberry Pi 5, Python 3, `firebase-admin`, `gpiozero`
- **Deployment:** Vercel (Web App)

---

## Hardware Setup (Tabletop Prototype)

To run the physical gate prototype, you need a Raspberry Pi connected to your Firebase database.

### Wiring Guide
- **Servo Motor (Gate):** Signal (Orange) ➔ `GPIO 17` (Pin 11), Power (Red) ➔ `5V` (Pin 2), Ground (Brown) ➔ `GND` (Pin 6).
- **Green LED (Granted):** Anode ➔ Resistor ➔ `GPIO 27` (Pin 13), Cathode ➔ `GND`.
- **Red LED (Denied/Closed):** Anode ➔ Resistor ➔ `GPIO 22` (Pin 15), Cathode ➔ `GND`.

### Running the Python Controller
1. Ensure Python libraries are installed on the Raspberry Pi:
   ```bash
   sudo apt install python3-gpiozero
   pip3 install firebase-admin
   ```
2. Place your `firebase-key.json` (Service Account Key) in the same directory as the script.
3. Run the controller:
   ```bash
   python3 gate_controller.py
   ```

---

## Project Structure
```
app/
 ├── admin/               # Admin dashboard and user management
 ├── api/
 │    └── pass-image/     # Dynamic PNG generation for WhatsApp previews
 ├── guard/               # Entry/Exit scanners and guard dashboard
 ├── pass/                # Publicly viewable visitor pass pages
 └── resident/            # Pass generation and history
components/               # Reusable UI components
lib/                      # Firebase config and Auth Context
```

## Getting Started (Local Development)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
