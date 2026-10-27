# 📋 RollCall Pro - Class Attendance Tracker

A modern, fast, and keyboard-friendly attendance taking application built with **React**, **Tailwind CSS**, and **Vite**, storing all data in browser **LocalStorage**.

---

## 🌟 Key Features

1. **Class Selection**:
   - Asks you to select which class you want to take attendance for as soon as you open the app.
   - Pre-loaded with sample classes (e.g. *Grade 10 - Section A*, *B.Tech CSE*, *Physics Lab*).
   - Create new classes with sequential roll number ranges (e.g., Roll 1 to 40) or custom student names.
   - Select attendance date (defaults to today).

2. **One-by-One Roll Call (Requested Core Feature)**:
   - Displays each student's **Roll Number** prominently one-by-one.
   - Large, thumb & click-friendly action buttons:
     - 🟢 **Green Button for PRESENT** (Keyboard: `[P]`, `[→]`, or `[Enter]`)
     - 🔴 **Red Button for ABSENT** (Keyboard: `[A]` or `[←]`)
   - Step backward anytime with `[Backspace]` or `[B]` to undo or correct a mistake.
   - Live progress bar with real-time Present & Absent counters.
   - Audio feedback (synthesized cheerful chime for Present, soft lower tone for Absent) with mute toggle.

3. **Attendance Summary & Review**:
   - Automatically opens upon marking the last student (or clicking *Finish & Review*).
   - Visual breakdown of Total, Present, and Absent statistics.
   - **🔴 Absentees List**:
     - Highlights all absent roll numbers.
     - **"Copy Absentee Notice"** button generates a clean WhatsApp / SMS ready message to share with departments or student groups.
   - **Interactive Roster Grid**: Click on any student's card to quickly toggle their status (ideal for latecomers).
   - **CSV Export**: Download attendance as a formatted Excel/CSV file.

4. **100% LocalStorage Persistence**:
   - All classes and historical attendance sessions are stored locally in your browser.
   - Revisit previous dates anytime via the **History** tab.

---

## 🚀 How to Run

### Method 1: Instant Standalone (Zero-Install)
You can test and use the application immediately without installing Node.js:
1. Double-click `standalone.html` in `attendance-app/`.
2. It will open in your default web browser (Brave, Chrome, Edge) with full LocalStorage and styling!

---

### Method 2: Vite Dev Server (React + Tailwind CSS)
If you have **Node.js** installed on your machine:
```bash
cd attendance-app
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: If Node.js is not yet installed on Windows, you can install it quickly using `winget install OpenJS.NodeJS` in PowerShell or by downloading from [nodejs.org](https://nodejs.org).

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| --- | --- |
| `P` or `→` or `Enter` | Mark **Present** (Green) & advance |
| `A` or `←` | Mark **Absent** (Red) & advance |
| `Backspace` or `B` | Go to **Previous Student** |
| `Space` or `↓` | Skip / Advance without changing |
