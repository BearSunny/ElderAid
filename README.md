# ElderAid

ElderAid is a React Native (Expo) mobile app designed to support elderly individuals — especially those with Alzheimer's — by providing personalized care, medication tracking, emotional support, emergency handling, and family connectivity. The app is currently under active development and is best run locally.

---

## Features

### 1. Chatbot Companion
- Text-based memory recall assistant
- "Show me my son's wedding" style memory prompts

### 2. Medication Management
- Upload photo of prescriptions
- Add & track medication schedules
- Voice notification reminders using TTS
- Mark medications as taken or not taken
- Logs stored per user in Firestore

### 3. Emergency Detection (Manual & Simulated)
- Auto-call emergency number (e.g., 911, 112)
- Alert family with:
  - Timestamp
  - GPS location
  - Trigger type (manual/fall detection)

### 4. Family Notifications
- Push notifications via Firebase Cloud Messaging
- View last emergency, interaction, or medication taken

### 5. Memory Lane
- Image carousel: family photos & key memories
- Audio playback of personalized voice messages

### 6. Caregiver Dashboard (Family Side)
- See real-time status of elder
- Emergency and medication logs
- Location tracking
- Quick contact button

---

## Future endeavours

### 1. Behavior Monitoring via Camera
- Fall detection via pose estimation (MediaPipe/OpenCV)
- Inactivity & wandering alerts
- Emotion detection for distress (advanced feature)
- Philips IP camera RTSP support (future)

### 2. Privacy & Access Control
- Toggle behavior monitoring ON/OFF
- Local-only image/video processing (privacy-first)
- Family access only via secure login

### 3. Chatbot interaction
- Future: voice-enabled interaction (Text-to-Speech + Speech-to-Text)

---

## Acknowledgments

### Built with:
- React Native
- Expo
- Firebase
- Lucide Icons
- OpenRouter API

---

## 📱 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Firebase project (see setup below)

### Installation

1. Clone the repo
```bash
git clone https://github.com/yourusername/elderaid.git
cd demo
npx expo start

