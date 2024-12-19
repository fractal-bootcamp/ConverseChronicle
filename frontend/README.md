# ConverseChronicle Frontend

A React Native mobile application for recording, transcribing, and managing conversations with an intuitive user interface and real-time audio visualization.

## 📱 Screenshots

<div align="center">
  <img src="public/screenshots/recording.png" alt="Recording Screen" width="250" />
  <img src="public/screenshots/details.png" alt="Details Screen" width="250" />
  <img src="public/screenshots/home.png" alt="Home Screen" width="250" />
</div>

## ✨ Features

- Real-time audio recording with waveform visualization
- Secure user authentication
- Conversation management and playback
- Interactive transcription viewer
- Dark mode support
- Gesture-based interactions
- Pull-to-refresh functionality

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Authentication**: Clerk
- **Animations**: Lottie
- **Styling**: React Native StyleSheet
- **Gestures**: React Native Gesture Handler
- **Audio**: Expo AV

## 📋 Prerequisites

- Node.js (v16+)
- Expo CLI
- iOS Simulator or Android Emulator
- npm or yarn

## 🔧 Installation

1. Clone the repository

```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
# Create a .env file with:
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## 🚀 Running the Application

### Development

```bash
npx expo start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## 📱 Screens

- **Authentication**
  - Sign In
  - Sign Up
  - Email Verification
- **Main**
  - Recording Screen
  - Recordings List
  - Recording Details

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/        # Authentication screens
│   ├── (home)/        # Main app screens
│   ├── components/    # Reusable components
│   │   ├── audio/     # Audio-related components
│   │   └── ...
│   └── config.ts      # App configuration
├── assets/
│   ├── animations/    # Lottie animation files
│   ├── fonts/        # Custom fonts
│   └── images/       # App images
└── types/            # TypeScript definitions
```

## 🎨 Components

### Key Components

- **AudioRecorder**: Records audio with real-time waveform visualization
- **AudioWaveform**: Displays audio waveform and metrics
- **RecordedFiles**: Manages and displays recorded conversations
- **RecordingDetails**: Shows detailed view of recordings with playback

## 🔒 Authentication

The app uses Clerk for authentication with features including:

- Email/password authentication
- Session management
- Protected routes
- Secure token handling

## 📱 Screen Navigation

The app uses Expo Router for file-based routing:

- `/(auth)/*` - Authentication routes
- `/(home)/*` - Main app routes
- `recording-details` - Dynamic route for recording details

## 🎯 Best Practices

- TypeScript for type safety
- Component composition for reusability
- Consistent styling patterns
- Error handling and loading states
- Responsive design
- Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
