# ConverseChronicle

ConverseChronicle is a React Native mobile application that enables users to record, transcribe, and analyze conversations with AI-powered insights. The application features real-time audio visualization, smart transcription, and conversation summarization.

## 📱 Screenshots

<div align="center">
  <img src="public/screenshots/recording.png" alt="Recording Screen" width="250" />
  <img src="public/screenshots/details.png" alt="Details Screen" width="250" />
  <img src="public/screenshots/home.png" alt="Home Screen" width="250" />
</div>

## 🌟 Overview

The project consists of two main components:

- A React Native mobile app with real-time audio recording and playback
- A Node.js backend service handling transcription and AI processing

## ✨ Key Features

- Real-time audio recording with waveform visualization
- AI-powered transcription and summarization
- Secure user authentication
- Conversation management and organization
- Dark mode support
- Cross-platform mobile support (iOS & Android)

## 🛠️ Tech Stack

### Frontend

- React Native with Expo
- Clerk Authentication
- Expo Router
- TypeScript
- Lottie Animations

### Backend

- Node.js & Express
- PostgreSQL & Prisma
- Anthropic Claude AI
- Deepgram Transcription
- Supabase Storage

## 🚀 Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd conversechronicle
```

2. Set up backend

```bash
cd backend
npm install
cp .env.template .env
# Configure environment variables
npm run dev
```

3. Set up frontend

```bash
cd frontend
npm install
# Configure environment variables
npx expo start
```

For detailed setup instructions, see:

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 📱 Screenshots

[Coming soon]

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

- [@chelsea-zhou](https://github.com/chelsea-zhou) - Chelsea
- [@cecepizza](https://github.com/cepiz) - Cece
- [@kmankan](https://github.com/mahlen) - Mahlen
