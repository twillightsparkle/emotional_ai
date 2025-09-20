# Emotional AI Avatar

An interactive 3D AI avatar that responds to your emotions and speech with realistic animations, facial expressions, and text-to-speech responses powered by Google's Gemini AI.

## Features

- 🎭 **Real-time Emotion Detection** - Uses face-api.js to detect and track facial emotions
- 🎤 **Voice Interaction** - Speech-to-text recognition for natural conversations
- 🤖 **AI Responses** - Powered by Google Gemini API for intelligent, context-aware responses
- 🎨 **3D Avatar** - Animated 3D character with facial expressions and realistic mouth movements
- 🗣️ **Text-to-Speech** - AI responses are spoken aloud with emotion-based voice modulation
- ⚡ **Real-time Rendering** - Built with React Three Fiber for smooth 3D performance

## Setup & Installation

### Prerequisites

- Node.js (version 16 or higher)
- A modern web browser with WebGL support
- Webcam and microphone access
- Google AI API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/twillightsparkle/emotional_ai.git
   cd emotional_ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_google_ai_api_key_here
   ```
   
   To get a Gemini API key:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account
   - Generate a new API key
   - Copy the key to your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Allow camera and microphone permissions when prompted

### Browser Permissions

The app requires the following browser permissions:
- **Camera access** - For real-time emotion detection
- **Microphone access** - For speech recognition
- **Audio playback** - For text-to-speech responses

## Usage

1. **Enable Face Tracking** - Click the "Enable Face Tracking" button to start emotion detection
2. **Start Recording** - Click the microphone button to begin voice interaction
3. **Speak Naturally** - Talk to the AI avatar and watch it respond with appropriate emotions and animations
4. **Observe Reactions** - The avatar will react to your detected emotions and provide contextual responses

## Tech Stack

- **Frontend**: React 18 + Vite
- **3D Graphics**: Three.js + React Three Fiber
- **3D Controls**: @react-three/drei
- **Face Detection**: face-api.js
- **AI Integration**: Google Gemini API
- **Speech Recognition**: Web Speech API
- **Text-to-Speech**: Speech Synthesis API

## Project Structure

```
src/
├── components/
│   ├── Model.jsx              # 3D avatar with animations
│   ├── FaceTracking.jsx       # Emotion detection
│   ├── AIResponseDisplay.jsx  # Text-to-speech responses
│   ├── SmartSpeechHandler.jsx # Speech recognition
│   └── Background.jsx         # 3D environment
├── services/
│   └── GeminiService.js       # AI API integration
├── App.jsx                    # Main application
└── main.jsx                   # React entry point

public/
├── models/                    # Face detection models
├── model/                     # 3D avatar model (.glb)
├── animation/                 # FBX animation files
└── texture/                   # Environment textures
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Compatibility

- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+

## Troubleshooting

### Common Issues

**Camera/Microphone not working:**
- Ensure HTTPS is enabled (required for WebRTC)
- Check browser permissions in settings
- Try refreshing the page and re-granting permissions

**API errors:**
- Verify your Gemini API key is correct in `.env`
- Check if you have API quota remaining
- Ensure your API key has the necessary permissions

**3D model not loading:**
- Check that all files in `public/model/` and `public/animation/` are present
- Verify WebGL is enabled in your browser

