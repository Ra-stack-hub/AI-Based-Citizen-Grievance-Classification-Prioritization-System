# 📱 GrievAI Mobile Application

[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-v58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/Tailwind_CSS-NativeWind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://www.nativewind.dev/)

**GrievAI Mobile** is the mobile client for the **AI-Based Citizen Grievance Classification & Prioritization System**. Designed for both **Citizens** and **Municipal Field Officers**, the application brings civic participation and real-time grievance redressal to smartphones with native device hardware integration (GPS, Camera, and Secure Storage).

---

## 🌟 App Overview & Purpose

In many municipal ecosystems, citizens encounter friction when reporting civic infrastructure failures (potholes, water leaks, broken streetlights, illegal garbage dumping). Field officers often lack mobile-friendly tools to inspect and resolve assigned grievances on-site.

**GrievAI Mobile solves this by:**
1. Empowering **citizens** to submit geo-tagged complaints with photographic evidence and voice/text descriptions directly from the scene in seconds.
2. Providing an embedded **AI Chatbot** that guides citizens, answers civic queries, and assists in ticket filing.
3. Equipping **civic officers** with a portable review dashboard to track assigned tickets, inspect AI-predicted urgency, update complaint lifecycles on the ground, and resolve issues with closure remarks.

---

## 📱 Key Features & Modules

### 1. 👥 Citizen Portal
- **One-Touch Complaint Submission (`/submit`)**:
  - Integrated with **`expo-location`** to fetch high-accuracy GPS coordinates automatically.
  - Integrated with **`expo-image-picker`** to capture real-time camera photos or select images from the gallery.
  - Instant text verification and AI processing triggering department routing and urgency scoring.
- **Ticket Tracking & Feed (`/track`)**:
  - Searchable list of personal and public civic complaints.
  - Interactive status timelines: `Submitted` ➔ `In Review` ➔ `In Progress` ➔ `Resolved`.
  - Severity/Priority badges (Critical, High, Medium, Low) and Department tags.
- **Citizen Dashboard (`/dashboard`)**:
  - Summary stats: Total complaints lodged, tickets resolved, and pending follow-ups.
  - Quick action buttons to lodge new grievances or talk to AI support.

### 2. 🤖 Interactive Mobile AI Chatbot (`/chatbot`)
- Conversational interface powered by the backend RAG and NLP services.
- Helps citizens formulate detailed complaints, checks ticket statuses, and provides answers regarding municipal rules and escalation paths.

### 3. 🛡️ Field Officer Review & Management (`/review/[id]`)
- **Role-Based Dynamic Interface**: Automatically presents the officer view upon logging in with administrative/officer credentials.
- **AI Insights Viewer**: Displays the AI-calculated urgency score, sentiment analysis, detected keywords, and department categorization.
- **On-Site Status Update**: Officers can update ticket progress (`In Progress`, `Resolved`, `Rejected`) and record resolution comments directly from their phones while in the field.

### 4. 🗺️ Hotspots & Civic Analytics (`/explore`)
- View grievance density and frequently reported civic problem clusters across wards and zones.

---

## 📂 Mobile Application Structure

```text
mobile/
├── src/
│   ├── app/                      # Expo Router (File-based navigation)
│   │   ├── _layout.tsx           # Global app layout & provider wrapper
│   │   ├── index.tsx             # Welcome / Landing screen
│   │   ├── login.tsx             # User authentication screen
│   │   ├── register.tsx          # New citizen / officer registration
│   │   ├── dashboard.tsx         # Unified dashboard router (Citizen / Admin)
│   │   ├── submit.tsx            # Complaint submission with GPS & Camera
│   │   ├── track.tsx             # Complaint tracker & timeline view
│   │   ├── chatbot.tsx           # AI Chatbot conversational screen
│   │   ├── explore.tsx           # Civic hotspots and analytics
│   │   └── review/
│   │       └── [id].tsx          # Officer ticket inspection & action screen
│   │
│   ├── components/               # Reusable UI widgets
│   │   ├── BottomNav.tsx         # Bottom tab navigation bar
│   │   ├── dashboard/
│   │   │   ├── CitizenDashboard.tsx  # Citizen statistics & recent complaints
│   │   │   └── AdminDashboard.tsx    # Officer task queue & filters
│   │   └── ui/                   # Reusable buttons, cards, inputs
│   │
│   └── context/
│       └── AuthContext.tsx       # Auth state, JWT token storage & API_URL
│
├── assets/                       # Icons, adaptive icons, and splash screens
├── app.json                      # Expo app configuration (permissions, package ID)
├── eas.json                      # EAS Build configuration (Android APK / AAB)
└── package.json
```

---

## ⚙️ Installation & Running

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go](https://expo.dev/go) app installed on your physical Android or iOS device (or an Android Emulator / iOS Simulator)
- Backend server running on your local machine (`http://<YOUR_IP>:8000`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend API Connection
Because physical mobile devices cannot access `localhost`, you must configure your computer's local Wi-Fi IP address:

1. Open PowerShell / Command Prompt on your computer and run:
   ```bash
   ipconfig
   ```
   Note down your **IPv4 Address** (e.g., `192.168.29.10`).

2. Verify or set `API_URL` in `src/context/AuthContext.tsx`:
   ```typescript
   export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://<YOUR_LAPTOP_IP>:8000/api/v1';
   ```
   *(Ensure both your phone and laptop are connected to the **same Wi-Fi network**)*.

### 3. Start Development Server
```bash
npx expo start
```
- Open the **Expo Go** app on your mobile phone and scan the displayed QR code.

---

## 📦 Building Standalone Android APK

The project is pre-configured with [EAS (Expo Application Services)](https://expo.dev/eas) to generate standalone `.apk` packages:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Build standalone Android APK
eas build --platform android --profile preview
```
Once the build completes on the cloud, a direct download link for the `.apk` file will be provided.

---

## 🎥 Project Demo Video

Watch the complete demonstration video of the project:  
📺 **[Click here to watch the Project Demo Video](https://drive.google.com/file/d/1JgdQh5eSx2mf-BV9qrF3m1i1wGnvkR1m/view?usp=sharing)**

