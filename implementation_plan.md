# Implementation Plan: Demo Pointer Fix, "Next Malware" Phase, Folder & Anti-Virus Apps

Implement the requested enhancements to CyberZero Chapter 1:
1. Fix the guided demo hand pointer so it remains steady and fixed without flipping between up and down emojis or jumping vertically.
2. Update the mission finish screen button from "Play Again" to **"NEXT MALWARE →"** (leading into Chapter 2: Malware Hunter).
3. Introduce two fully functional desktop applications: **Folder** (File Explorer) and **Anti-Virus** (Security Scanner).
4. Implement the Malware Hunt gameplay: change HUD from "EMAIL" to "MALWARE", where players browse files in the Folder app, inspect extensions/signatures, scan with Anti-Virus, and neutralize malware threats.

---

## User Review Required

> [!IMPORTANT]
> - **Demo Hand Pointer**: The demo cursor will use a steady, uniform pointer (`👆` or smooth SVG pointer) that moves directly to targets without swapping between `👆` and `👇` or bouncing up and down.
> - **Mission Progression**: After completing the 5 emails, the finish screen will present **"🛡️ NEXT MALWARE →"** as the primary button to advance to the Malware Hunting phase. A secondary "Play Emails Again" option will remain accessible.
> - **New Desktop Apps**: Both **Folder** (📁) and **Anti-Virus** (🛡️) will be integrated with desktop icons, taskbar buttons, draggable windows, and minimize/maximize/close controls.
> - **Malware Mechanics**: In the malware phase, the HUD email counter changes to `MALWARE: 0 / 4`. The Folder contains 8 realistic files (4 legitimate documents/images and 4 disguised malware threats: double-extension executable `.pdf.exe`, script dropper `.vbs`, malicious screensaver `.scr`, and trojan binary). Players can inspect files and use the Anti-Virus scanner to identify and quarantine threats.

---

## Proposed Changes

### 1. Guided Demo Pointer Fix

#### [MODIFY] [script.js](file:///c:/Users/jbata/Downloads/CyberZero%20Chapter%201%20Gameplay/script.js)
- In `clickEffect(cb)`: Remove the emoji swap from `👆` to `👇`. Replace with a smooth scale-down tap (`scale(0.9)`) so the finger stays fixed and pointing in the same direction.
- In `animateCursorTo(targetId, cb)`: Align coordinates cleanly to the target center without abrupt vertical offsets, ensuring smooth linear translation.

#### [MODIFY] [style.css](file:///c:/Users/jbata/Downloads/CyberZero%20Chapter%201%20Gameplay/style.css)
- Refine `.gdemo-cursor` styling to eliminate any unexpected vertical transitions or jumping.

---

### 2. Desktop Environment: Folder & Anti-Virus Apps

#### [MODIFY] [index.html](file:///c:/Users/jbata/Downloads/CyberZero%20Chapter%201%20Gameplay/index.html)
- **Desktop Icons**:
  - Add 📁 **Folder** icon (`#icon-folder`).
  - Add 🛡️ **Anti-Virus** icon (`#icon-antivirus`).
- **Taskbar**:
  - Add taskbar buttons for `#taskbar-folder` and `#taskbar-antivirus`.
- **Folder Window (`#win-folder`)**:
  - Titlebar with minimize/maximize/close controls.
  - Toolbar with path breadcrumb (`📁 This PC > Downloads`), search bar, view switcher.
  - File list displaying file name, type, size, date modified, and status badges.
  - File detail preview pane with file hash, true extension analysis, and quick action: "🛡️ Scan with Anti-Virus" and "🚩 Quarantine Malware".
- **Anti-Virus Window (`#win-antivirus`)**:
  - Titlebar with minimize/maximize/close controls.
  - Cyberpunk security scanner UI: system status, virus database version, live file scanner pane with scan animation, threat diagnosis card (Trojan/Ransomware/Clean), and Quarantine button.
- **Finish Screen Button**:
  - Update `#overlay-results` button to `<button class="btn-primary" onclick="startMalwareMission()">🛡️ NEXT MALWARE →</button>`.

#### [MODIFY] [style.css](file:///c:/Users/jbata/Downloads/CyberZero%20Chapter%201%20Gameplay/style.css)
- Windows styling for `#win-folder` (dark modern file explorer layout, file table, hover states, badges for flagged/quarantined files).
- Styling for `#win-antivirus` (sleek security dashboard, radar scan animation, danger/clean status cards, action buttons).

---

### 3. Malware Investigation Logic & HUD

#### [MODIFY] [script.js](file:///c:/Users/jbata/Downloads/CyberZero%20Chapter%201%20Gameplay/script.js)
- Extend `appState` to include `folder` and `antivirus`.
- Update `updateTaskbar()` to dynamically support all apps (`gmail`, `browser`, `folder`, `antivirus`).
- Add malware file database `MALWARE_FILES`:
  1. `bonus_payroll_sept.pdf.exe` (Malware: Double extension executable disguised as PDF)
  2. `project_roadmap_2026.docx` (Clean: Legitimate Word document)
  3. `security_credential_patch.scr` (Malware: Executable screensaver payload)
  4. `meeting_recording_notes.pdf` (Clean: Legitimate company document)
  5. `overdue_invoice_inv3891.vbs` (Malware: VBScript trojan dropper)
  6. `team_photo_offsite.jpg` (Clean: Standard JPEG image)
  7. `bitcoin_mining_accelerator.exe` (Malware: Unauthorized coinminer binary)
  8. `q3_financial_statement.xlsx` (Clean: Standard Excel spreadsheet)
- Implement `startMalwareMission()`:
  - Updates HUD: `#hud-email-label` changes to `"MALWARE"`, count displays `0 / 4`.
  - Opens Folder and Anti-Virus apps on desktop.
  - Notifies player with briefing toast: `"📁 Chapter 2: Inspect files in Folder and use Anti-Virus to quarantine all 4 malware threats!"`
- Implement file actions:
  - `selectFolderFile(fileId)`: displays detailed file properties, SHA-256 hash, and inspection hints.
  - `scanFileInAntivirus(fileId)`: runs scanning animation in Anti-Virus window and displays threat verdict.
  - `quarantineFile(fileId)`: verifies if file is malware.
    - If Malware: marks quarantined, awards +100 points, increments `gameState.malwareQuarantined`, updates HUD count (`N / 4`), shows success toast.
    - If Clean: warns about false positive (-25 points).
  - When all 4 malware threats are quarantined: displays Chapter 2 Victory Dialog with score and rank!

---

## Verification Plan

### Automated Browser Subagent Verification
1. **Demo Cursor Check**: Run through the guided demo; observe cursor movement across header, sender, flag button, urgency text, link, and report button to confirm the pointer does not flip or bounce up/down.
2. **Finish Screen Check**: Complete email phase (or trigger finish); confirm the button says **"🛡️ NEXT MALWARE →"**.
3. **App Windows**: Click "NEXT MALWARE →"; verify Folder and Anti-Virus open cleanly on the desktop, taskbar buttons light up, and windows can be dragged, minimized, and maximized.
4. **HUD Update**: Confirm the HUD label changes from `EMAIL` to `MALWARE` with `0 / 4`.
5. **Malware Hunting Flow**:
   - Inspect files in the Folder app.
   - Scan `bonus_payroll_sept.pdf.exe` in Anti-Virus -> verify threat detected.
   - Quarantine the malware -> verify HUD updates to `1 / 4` and points are awarded.
   - Scan and quarantine remaining 3 malware threats.
   - Confirm completion screen triggers when all 4 are neutralized.
