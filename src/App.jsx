import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Model } from './components/Model'
import { Background } from './components/Background'
import { FaceTracking } from './components/FaceTracking'
import SmartSpeechHandler from './components/SmartSpeechHandler'
import AIResponseDisplay from './components/AIResponseDisplay'
import './App.css'

function App() {
  const [faceTrackingActive, setFaceTrackingActive] = useState(false)
  const [detectedEmotion, setDetectedEmotion] = useState('neutral')
  const [aiResponses, setAiResponses] = useState([])
  const [currentAnimation, setCurrentAnimation] = useState('Idle.fbx')
  const [aiEmotion, setAiEmotion] = useState('neutral')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [autoRecordingEnabled, setAutoRecordingEnabled] = useState(false)

  // Handle emotion detection from face tracking
  const handleEmotionDetected = (emotion) => {
    setDetectedEmotion(emotion)
  }



  // Handle face detection status
  const handleFaceDetected = (detected) => {
    setFaceDetected(detected)
    
    // Enable automatic recording when face is detected and face tracking is active
    if (detected && faceTrackingActive) {
      setAutoRecordingEnabled(true)
    } else {
      setAutoRecordingEnabled(false)
    }
  }

  // Toggle face tracking
  const toggleFaceTracking = () => {
    const newState = !faceTrackingActive
    setFaceTrackingActive(newState)
    
    // Enable/disable automatic recording based on face tracking state
    if (!newState) {
      setAutoRecordingEnabled(false)
      setFaceDetected(false)
    }
  }

  // Handle AI responses from speech
  const handleGeminiResponse = (responseData) => {
    setAiResponses(prev => [...prev, responseData])
    
    // Update AI emotion if provided
    if (responseData.aiEmotion) {
      setAiEmotion(responseData.aiEmotion)
    }
  }

  // Handle animation changes from AI responses
  const handleAnimationChange = (animation) => {
    setCurrentAnimation(animation)
    
    // Return to idle after animation duration (approximate)
    setTimeout(() => {
      setCurrentAnimation('Idle.fbx')
    }, 5000) // 5 seconds, adjust based on animation length
  }

  // Reset emotions to neutral after conversation
  const handleEmotionReset = () => {
    setAiEmotion('neutral')
  }

  // Clear AI responses
  const clearAiResponses = () => {
    setAiResponses([])
  }

  // Make clear function available globally for the display component
  window.clearAIResponses = clearAiResponses

  // Current emotion based on mode
  const currentEmotion = faceTrackingActive 
      ? detectedEmotion 
      : 'neutral' // Default to neutral when no tracking is active

  return (
    <div className="app">
      {/* Face Tracking Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px 20px',
        borderRadius: '25px',
        color: 'white',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={toggleFaceTracking}
          style={{
            padding: '8px 16px',
            background: faceTrackingActive ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {faceTrackingActive ? '📹 Stop Face Tracking' : '📹 Start Face Tracking'}
        </button>
      </div>

      {/* Face Tracking Component */}
      <FaceTracking 
        isActive={faceTrackingActive}
        onEmotionDetected={handleEmotionDetected}
        onFaceDetected={handleFaceDetected}
      />

      {/* Smart Speech Handler - AI Friend */}
        <SmartSpeechHandler 
          currentEmotion={currentEmotion}
          onGeminiResponse={handleGeminiResponse}
          onEmotionChange={setAiEmotion}
          onAnimationChange={handleAnimationChange}
          onEmotionReset={handleEmotionReset}
          autoRecordingEnabled={autoRecordingEnabled}
          isSpeaking={isSpeaking}
        />

      {/* AI Response Display */}
      <AIResponseDisplay 
        responses={aiResponses} 
        onSpeakingStateChange={setIsSpeaking}
      />

      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Background Image */}
        <Background />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* 3D Model with loading fallback */}
        <Suspense fallback={null}>
          <Model 
            emotion={aiEmotion} 
            currentAnimation={currentAnimation} 
            isSpeaking={isSpeaking}
          />
        </Suspense>
        
        {/* Camera Controls 
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
        />
        */}

        {/* Environment for better lighting */}
        <Environment preset="studio" />
      </Canvas>
      
    </div>
  )
}

export default App