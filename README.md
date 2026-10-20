<div align="center">

# 🕵️‍♂️ CYBERZERØ (CyberZero)

### _An Immersive Web-Based Simulation Game for Enhancing Cyber Threat Awareness & Defensive Skills_

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-blue.svg?style=for-the-badge)](https://unlicense.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen?style=for-the-badge)](#-tech-stack)
[![GitHub Pages Ready](https://img.shields.io/badge/GitHub_Pages-Ready-success?style=for-the-badge&logo=github)](https://pages.github.com/)

<p align="center">
  <strong>"Don't just guess that something is a cyber threat. Find the evidence."</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-game-concept--story">Story & Characters</a> •
  <a href="#-complete-gameflow">Gameflow</a> •
  <a href="#-the-four-chapters">Chapters</a> •
  <a href="#-simulated-desktop-os-environment">Desktop OS</a> •
  <a href="#-scoring--ranking-system">Scoring & Ranks</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

</div>

---

## 📖 Overview

**CYBERZERØ** is an interactive, story-driven cybersecurity training game built entirely in **pure Vanilla HTML5, CSS3, and modern JavaScript**. Requiring no external frameworks, dependencies, or backend servers, the game runs directly in any modern web browser and immerses players in a realistic **simulated desktop operating system**.

Instead of passive slide presentations or generic multiple-choice quizzes, players step into the shoes of student cyber defenders guided by **Ryan (IT Support Mentor)**. Players inspect suspicious emails, spot disguised malware payloads, analyze dangerous links, foil impersonation scams, configure public Wi-Fi security, and respond to emergency ransomware incidents.

### 🎯 Key Highlights

- 🖥️ **Simulated Desktop Environment**: Window multitasking (drag, minimize, maximize, snap), taskbar, start menu, system tray, real-time clock, network flyouts, and realistic sound effects.
- 🔍 **Interactive Evidence-Flagging Engine**: Toggle **Flag Mode** to inspect and pinpoint specific phishing indicators (spoofed domains, false urgency, mismatched hyperlinks, malicious attachments).
- 🧑‍🏫 **Dynamic AI Mentor Guidance**: **Ryan (IT Support Mentor)** monitors decisions, provides real-time coaching, explains missed indicators, and penalizes careless guesses.
- 📱 **Interactive Phone Link App**: A dual-panel smartphone companion featuring a live mobile home screen with **Messages** and **Calls** apps, status bar, and conversation forensics.
- 🛡️ **Multi-Threat Investigation Suite**: Covers the critical pillars of cyber defense: **Phishing**, **Malware & Trojans**, **Social Engineering & Wi-Fi Security**, and **Ransomware Incident Response**.
- ⚡ **Zero Installation & Setup**: 100% client-side. Double-click `index.html` or host directly on GitHub Pages.

---

## 👥 Game Concept & Story

When an academic cohort collaborates on a critical multimedia graduation capstone project, real-world cyber adversaries launch targeted attacks against their accounts, personal devices, and shared drives. Guided by their dedicated IT Support Mentor, the team must analyze digital clues, isolate infected nodes, and safeguard their work.

```
       ┌────────────────────────────────────────────────────────┐
       │                👨‍💼 RYAN (IT Support Mentor)             │
       │       Senior Mentor, Security Guide & Forensic Analyst │
       └──────────────────────────┬─────────────────────────────┘
                                  │
     ┌──────────────┬─────────────┴─────────────┬──────────────┐
     ▼              ▼                           ▼              ▼
  💻 ALEX        👧 PIA                      👦 ETHAN       👦 CARLO
Lead Detective  Targeted Account            Team Member    Classmate /
Player Hero     & Verification              Collaborator   Source of Links
```

### The Characters

| Character | Role in Narrative | Mission Significance |
| :--- | :--- | :--- |
| **Ryan** | 👨‍💼 **IT Support Mentor** | Guides the player through tutorials, reviews investigation evidence, and delivers forensic debriefs. |
| **Alex** | 💻 **Lead Detective (Player)** | The protagonist operating the cyber workstation, inspecting digital artifacts, and neutralizing threats. |
| **Pia** | 👧 **Project Collaborator** | A classmate whose identity is spoofed by social engineering attackers attempting credential theft. |
| **Ethan** | 👦 **Technical Teammate** | Assists with team communications and shares files on project network shares. |
| **Carlo** | 👦 **Classmate** | Sends external design tool links that must be scrutinized for disguised executable malware. |

---

## 🔄 Complete Gameflow

CYBERZERØ follows a continuous, narrative-driven gameplay loop where knowledge gained in each stage prepares the player for more sophisticated cyber threats:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            1. TITLE & COVER SCREEN                           │
│     Main Menu: Start Game • Story Selection • Audio Settings • Instructions  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         2. CHAPTER STORY SELECTION                           │
│   Chapter 1 (The First Day) ➔ Chapter 2 ➔ Chapter 3 ➔ Chapter 4 Progression  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    3. CINEMATIC MANGA / COMIC INTRO                          │
│     Panel-by-panel comic strip detailing the emerging threat & story context │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                   4. SIMULATED DESKTOP OS ENVIRONMENT                        │
│      Lockscreen / Login ➔ Windows Desktop ➔ Ryan Mentor Briefing Dialogue    │
│      Draggable Task List Sticky Note provides real-time mission objectives   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      5. ACTIVE FORENSIC INVESTIGATION                        │
│                                                                              │
│   📧 Zmail Inbox: Flag fake sender, urgent text, mismatched links, attachments│
│   🌐 Cyber-Net Browser: Inspect target URLs, domain security & threat intel  │
│   📁 File Explorer: Audit double extensions (.pdf.exe), hashes, file types   │
│   🛡️ Anti-Virus: Run heuristic signature scans & quarantine malicious files   │
│   📱 Phone Link: Review mobile messages, calls, and impersonation attempts    │
│   📶 Network Settings: Disable public sharing & isolate network adapters     │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       6. VERDICT & INCIDENT ACTION                           │
│      Submit Classification (Phishing vs. Legit / Quarantine / Isolate)       │
│      Ryan Mentor provides instant analysis of evidence found vs. missed      │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      7. MISSION RESULTS & ADVANCEMENT                        │
│      Score Calculation • Accuracy Rating (S/A/B/C/D) • Chapter Next Unlock   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎮 The Four Chapters

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER 1: THE FIRST DAY — PHISHING INVESTIGATION                               │
│ Examine dynamic incoming email waves in Zmail. Flag deceptive domains, false    │
│ urgency, and spoofed links. Review decisions with Ryan's forensic breakdown.    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CHAPTER 2: THE DIGITAL TRAP — MALWARE HUNTING & EXTENSIONS                      │
│ Unlocks File Explorer & Anti-Virus. Unmask disguised executables (.pdf.exe),    │
│ analyze SHA-256 hashes, scan suspicious binaries, and quarantine threats.      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CHAPTER 3: THE SYSTEM COLLAPSE — SOCIAL ENGINEERING & WI-FI                     │
│ Secure public Wi-Fi settings, investigate communications in Phone Link, and     │
│ stop impersonators attempting to harvest student credentials and passwords.     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CHAPTER 4: THE LAST LOGIN — RANSOMWARE EMERGENCY RESPONSE                       │
│ High-stakes containment! Cut network isolation switches, terminate malicious   │
│ dropper processes in Task Manager, and restore files from clean backups.        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1️⃣ Chapter 1: The First Day (Phishing Defense)

- **Scenario**: Alex's first day in the team workstation begins with an influx of academic and workplace emails.
- **Investigation Mechanics**:
  - Open **Zmail** to inspect dynamic inbox waves.
  - Activate **🚩 Flag Mode** to click directly on suspicious elements:
    - 📛 **Sender Address Spoofing**: e.g., `payroll-notice@secure-portal.com.co` instead of the official institution domain.
    - ⏳ **Coercive Urgency**: Arbitrary deadlines ("Your account will be deleted in 15 minutes!").
    - 🔗 **Mismatched Link Targets**: Anchor text says one domain, but hover destination points elsewhere.
    - 📎 **Suspicious Attachments**: Unrequested `.zip`, `.exe`, or macro-enabled documents.
  - Use the **Browser** to safely cross-check domain authenticity.
  - Choose **Phishing** or **Non-phishing** to submit verdicts.

### 2️⃣ Chapter 2: The Digital Trap (Malware Forensics)

- **Scenario**: Downloaded assets and design templates arrive from external forums and classmate shares.
- **Investigation Mechanics**:
  - Open **Folder (File Explorer)** with detailed file properties, sizes, and file type associations.
  - Unmask **double-extension deception** (e.g., `scholarship_form.pdf.exe`).
  - Cross-check file cryptographic SHA-256 hashes against known threat signatures.
  - Launch **Anti-Virus (Security Scanner)** to scan suspect files.
  - Quarantine verified malware payloads while avoiding false positives on clean project assets.

### 3️⃣ Chapter 3: The System Collapse (Social Engineering & Public Wi-Fi)

- **Scenario**: The team works remotely from a public network while receiving urgent text messages and direct messages.
- **Investigation Mechanics**:
  - Open **Settings > Network & Internet > Wi-Fi** to disable dangerous public network exposures (file sharing, device discovery).
  - Open **Phone Link** to inspect mobile communications.
  - Access the phone launcher featuring **Messages** and **Calls** apps.
  - Investigate impersonation attempts (e.g., "Pia — New Account") soliciting student IDs and birthdays.
  - Enforce the **Zero-Trust Rule**: Never share credentials or OTPs via direct messages.

### 4️⃣ Chapter 4: The Last Login (Ransomware Incident Response)

- **Scenario**: A malicious executable attempts to encrypt shared project drives, threatening total loss of the team's work.
- **Investigation Mechanics**:
  - **Immediate Network Severance**: Disconnect network adapters to stop lateral infection spread.
  - **Process Neutralization**: Use Task Manager to locate high-CPU malicious dropper processes and terminate them.
  - **Backup Verification & Restore**: Inspect clean vault backups, verify file hashes, and restore unencrypted files.

---

## 🖥️ Simulated Desktop OS Environment

CYBERZERØ provides a complete cyber workstation OS built from scratch:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📁 Folder]   [📧 Zmail]   [🌐 Browser]   [🛡️ Anti-Virus]   [📱 Phone Link]    │
│                                                                                │
│   ┌───────────────────────────┐     ┌────────────────────────────────────┐     │
│   │ 📧 Zmail (Inbox)    ─ □ ✕ │     │ 📱 Phone Link                ─ □ ✕ │     │
│   ├───────────────────────────┤     ├────────────────────────────────────┤     │
│   │ 📥 Inbox (Wave 1)         │     │ [📱 Phone Screen]  │ [💬 Messages] │     │
│   │ 🚩 Flags Placed: 2        │     │  10:42 PM          │  No messages  │     │
│   │ [ REPORT AS PHISHING ]    │     │  [💬] [📞]         │  No direct msgs│    │
│   └───────────────────────────┘     └────────────────────────────────────┘     │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│ 🪟 Start  |  📧 Zmail   🌐 Browser   📁 Files   🛡️ AV   📱 Phone  | 🔊 📶 10:42│
└────────────────────────────────────────────────────────────────────────────────┘
```

### Applications Suite

| App Icon | Application | Role in Investigation |
| :---: | :--- | :--- |
| 📧 | **Zmail (Email Client)** | Inspect headers, read message bodies, place evidence flags, and submit phishing reports. |
| 🌐 | **Cyber-Net Browser** | Inspect destination URLs, search threat intelligence databases, and check SSL certificates. |
| 📁 | **File Explorer (Folder)** | Inspect file properties, reveal true file extensions, and check file sizes and dates. |
| 🛡️ | **Anti-Virus (Scanner)** | Run heuristic malware scans, view threat diagnosis, and quarantine dangerous payloads. |
| 📱 | **Phone Link** | Connected smartphone companion with a 2-app mobile launcher (**Messages** & **Calls**) and forensics view. |
| ⚙️ | **Wi-Fi & Network Settings** | Configure network profiles, disable public file sharing, and isolate adapters during attacks. |
| 📊 | **Task Manager** | Identify rogue processes, monitor resource usage, and terminate malicious executables. |
| 📒 | **Sticky Notes** | Draggable, real-time checklist tracking current mission objectives and investigative scoring rules. |

---

## 🏆 Scoring & Ranking System

CYBERZERØ uses a rigorous evidence-based scoring algorithm: points are awarded for **correct verdicts backed by valid digital evidence**, while wild guesses and false alarms incur penalties.

```
TOTAL SCORE = Decision Points + Valid Evidence Points - Penalties
```

### Scoring Matrix

| Action | Points | Description |
| :--- | :---: | :--- |
| **Phishing Verdict (Evidence Backed)** | `+100` | Correctly identified phishing with at least 1 verified evidence flag placed. |
| **Phishing Verdict (Blind Guess)** | `+0` | Called phishing correctly, but found 0 evidence flags (discourages guessing). |
| **Legitimate Verdict** | `+50` | Correctly verified clean email without false alarms. |
| **Correct Evidence Flag** | `+25` | Pinned an actual phishing indicator (spoofed domain, false urgency, mismatched link). |
| **Incorrect Verdict** | `-50` | Marked a legitimate email as phishing, or fell for an attack. |
| **Incorrect Evidence Flag** | `-10` | Flagged safe or standard text as suspicious. |
| **Missed Clue Penalty** | `-25` | Overlooked an obvious threat indicator present in the communication. |
| **Malware Neutralized** | `+100` | Quarantined a verified malicious binary or script dropper. |
| **False Positive Quarantine** | `-25` | Quarantined a safe, legitimate project document or image. |
| **Contradiction Penalty** | `0 Total` | Submitting flags while choosing "Legitimate" voids the investigation report. |

### Detective Ranks

| Rank Badge | Rank Title | Score Bracket | Rating Description |
| :---: | :--- | :---: | :--- |
| 🏅 **S** | **Master Cyber Detective** | `95% – 100%` | Flawless investigation. Every clue spotted with zero false alarms. |
| ⭐ **A** | **Senior Cyber Investigator** | `85% – 94%` | High-accuracy detection with minimal oversights. |
| 👍 **B** | **Cyber Defense Agent** | `70% – 84%` | Solid performance; caught major threats but missed subtle cues. |
| 📚 **C** | **Junior Analyst in Training** | `50% – 69%` | Inconsistent evidence gathering; needs additional defensive review. |
| ⚠️ **D** | **Investigation Compromised** | `< 50%` | Critical threats missed or multiple false alarms triggered. |

---

## 🚀 Getting Started

Because CYBERZERØ is built entirely with standard web standards, there are **no build steps, Node packages, or backend servers required**.

### Option A: Run Locally (Instant)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CyberZero-Phishing.git
   cd CyberZero-Phishing
   ```

2. **Open the game**:
   - Double-click `index.html` in your file explorer, **OR**
   - Right-click `index.html` and choose **Open with > Chrome / Firefox / Edge / Safari**.

3. *(Optional)* **Run via local development server**:
   ```bash
   # Using Python 3:
   python -m http.server 8080

   # Or using Node npx:
   npx serve .
   ```
   Navigate to `http://localhost:8080` in your web browser.

---

### Option B: Deploy to GitHub Pages (Free Hosting in 1 Minute)

1. Fork or push this repository to your GitHub account.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Your game will be live at:
   ```
   https://<your-username>.github.io/<repository-name>/
   ```

---

## 📁 Project Structure

```
CyberZero-Phishing/
│
├── index.html               # Main desktop OS DOM structure, window templates & overlays
├── src/css/                 # Split stylesheets (38 files, loaded in cascade order by index.html)
├── src/js/                  # Split game scripts (56 classic scripts incl. Firebase auth gate, load order = index.html order)
├── _backup_original/        # Pre-refactor script.js, style.css, index.html (not loaded)
├── implementation_plan.md   # Architectural design specifications & enhancement roadmaps
├── LICENSE                  # The Unlicense (Public Domain dedication)
├── README.md                # Comprehensive project documentation & gameplay guide
│
└── assets/                  # Complete visual, audio, and cinematic asset library
    ├── Achievements/        # Badge artwork and award icons
    ├── background/          # Wallpaper variants and UI backgrounds
    ├── Chapter1/            # Chapter 1 comic panels and cutscenes
    ├── Chapter2/            # Chapter 2 comic panels and cutscenes
    ├── Chapter3/            # Chapter 3 comic panels and cutscenes
    ├── Chapter4/            # Chapter 4 comic panels and cutscenes
    ├── Character/           # Character sprites (Alex, Ryan, Pia, Ethan)
    ├── Desktop/             # Lockscreen, Login, and high-res OS wallpapers
    ├── fonts/               # Offline webfonts (QB-One, Orbitron, JetBrains Mono)
    ├── icons/               # SVG & PNG icon pack for apps, networks, and files
    │   ├── apps/            # Application icons (mail, browser, folder, etc.)
    │   ├── email/           # Classification verdict icons (Phishing, Legit)
    │   ├── folder icons/    # Explorer file type icons (pdf, exe, vbs, docx)
    │   └── networks/        # Network tray & settings icons (Wi-Fi, Bluetooth)
    ├── logo/                # CyberZero branding and shield emblems
    ├── sounds/              # Audio effects (clicks, alerts, window sounds, success chimes)
    ├── Story Selection/     # Chapter thumbnail cards and preview banners
    └── video/               # Story cutscenes and introductory media
```

---

## 🛡️ Educational Value & Safe Simulation Design

CYBERZERØ was developed to reinforce practical digital literacy and defensive cybersecurity habits:

- 🔒 **100% Safe Simulation**: All email addresses, URLs, and phone numbers use RFC 2606 reserved domains (`.example`, `.test`, or simulated mock endpoints). No live external systems or actual malware are ever used.
- 🎯 **Critical Thinking Over Memorization**: Teaches users _how_ attackers engineer urgency, spoof headers, and hide executable extensions inside routine office files.
- 🏢 **Applicable Across Educational Levels**: Ideal for high school classrooms, university computing labs, corporate security awareness training, and cybersecurity bootcamps.

---

## 📜 License

This project is released into the public domain under the **[The Unlicense](LICENSE)**. Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software for educational or commercial purposes.

---

<div align="center">

**Developed with ❤️ for aspiring Cyber Detectives everywhere.**  
_Stay vigilant. Check the sender. Inspect the link. Trust the evidence._

</div>
