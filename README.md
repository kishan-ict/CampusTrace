# CampusTrace: Smart Campus Lost & Found

An intelligent, zero-cost progressive web application (PWA) designed to reconnect students with lost belongings across campus through AI auto-tagging, anti-fraud secret questions, single-use 2-day QR handover passes, and girl student safe in-app chat.

---

## 🌟 Core Features

- **Google Gemini AI Auto-Tagging:** Automatically detects category, colors, and search tags from photos.
- **Anti-Fraud Secret Verification:** Finders set a secret question; claimants must answer correctly before handover approval.
- **2-Day Single-Use Handover QR Pass:** Finder generates the QR code upon approval; receiver scans it or retrieves a 6-digit PIN to finalize handover and award +100 Hero Points.
- **Girl Student Privacy Shield:** Female students do not have their phone numbers exposed; direct in-app messaging coordinates secure handover safely.
- **Claimed Items Archive & Moderator Disputes:** If an item is wrongfully claimed, students can dispute it with 1 click. Campus Safety Moderators inspect the 360° audit file and investigate via direct chat.
- **Campus Admin Center:** Campus Administrators can create and revoke credentials for moderators and security staff.
- **100% Free Zero-Cost Cloud Architecture:** Uses Cloud Firestore with client-side image compression, avoiding costly cloud storage buckets ($0 cost).

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kishan-ict/CampusTrace.git
cd CampusTrace
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your **Google Gemini API Key** and **Firebase Configuration** values inside `.env`.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Lucide Icons, Canvas Confetti
- **QR & Scanner:** QRCode, HTML5-QRCode
- **AI:** Google Gemini API (`@google/genai` / REST)
- **Database:** Firebase Cloud Firestore (Spark Free Tier)
