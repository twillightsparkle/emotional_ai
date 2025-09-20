import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Model } from './components/Model'
import { Background } from './components/Background'
import { FaceTracking } from './components/FaceTracking'
import './App.css'

function App() {
  const [selectedEmotion, setSelectedEmotion] = useState('neutral')
  const [faceTrackingActive, setFaceTrackingActive] = useState(false)
  const [detectedEmotion, setDetectedEmotion] = useState('neutral')

  const emotions = [
    'neutral', 'happy', 'sad', 'surprised', 'angry', 'disgusted', 
    'excited', 'thinking', 'confused', 'smirk', 'kiss', 'wink', 'shock'
  ]

  // Handle emotion detection from face tracking
  const handleEmotionDetected = (emotion) => {
    setDetectedEmotion(emotion)
    setSelectedEmotion(emotion)
  }

  // Toggle face tracking
  const toggleFaceTracking = () => {
    setFaceTrackingActive(!faceTrackingActive)
  }

  // Current emotion based on mode
  const currentEmotion = faceTrackingActive ? detectedEmotion : selectedEmotion

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
        color: 'white'
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
      />

      {/* Manual Emotion Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        maxHeight: '80vh',
        overflowY: 'auto',
        opacity: faceTrackingActive ? 0.6 : 1
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
          {faceTrackingActive ? 'Manual Override' : 'Avatar Emotions'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {emotions.map(emotion => (
            <button
              key={emotion}
              onClick={() => {
                setSelectedEmotion(emotion)
                if (faceTrackingActive) {
                  setFaceTrackingActive(false) // Switch to manual mode
                }
              }}
              style={{
                padding: '8px 12px',
                background: currentEmotion === emotion ? '#4CAF50' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '12px'
              }}
            >
              {emotion}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
          Current: <strong>{currentEmotion}</strong>
          {faceTrackingActive && (
            <div style={{ color: '#4CAF50' }}>🔴 Face Tracking Active</div>
          )}
        </div>
      </div>

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
          <Model emotion={currentEmotion} />
        </Suspense>
        
        {/* Camera Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
        />
        
        {/* Environment for better lighting */}
        <Environment preset="studio" />
      </Canvas>
      
    </div>
  )
}

export default App
