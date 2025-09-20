import { useState, useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'

export function FaceTracking({ isActive, onEmotionDetected }) {
  const [detectedEmotion, setDetectedEmotion] = useState('neutral')
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const videoRef = useRef()
  const canvasRef = useRef()
  const detectionIntervalRef = useRef()
  const streamRef = useRef() // Store the stream separately for cleanup

  // Map Face-API emotions to avatar emotions
  const mapFaceApiToAvatar = (expressions) => {
    const emotionScores = Object.entries(expressions)
      .sort((a, b) => b[1] - a[1]) // Sort by confidence
    
    const topEmotion = emotionScores[0]
    if (topEmotion[1] < 0.4) return 'neutral' // Confidence threshold
    
    const emotionMap = {
      'angry': 'angry',
      'disgusted': 'disgusted', 
      'fearful': 'surprised',
      'happy': 'happy',
      'neutral': 'neutral',
      'sad': 'sad',
      'surprised': 'surprised'
    }
    
    return emotionMap[topEmotion[0]] || 'neutral'
  }

  // Start video stream
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        streamRef.current = currentStream // Store stream reference
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream
          console.log('Video srcObject set')
        }
      })
      .catch((err) => {
        console.log('Camera access denied:', err)
      })
  }

  // Stop video stream
  const stopVideo = () => {
    
    // Try to stop from stored stream reference first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.readyState)
        track.stop()
        console.log('Track stopped, new state:', track.readyState)
      })
      streamRef.current = null
    }
    
    // Also clean up video element if it exists
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null
    }
  }

  // Load Face-API models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models")
      ])
      setIsModelLoaded(true)
    } catch (err) {
      console.error('Error loading models:', err)
    }
  }

  // Face detection loop
  const faceDetectionLoop = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()

        // Clear canvas
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Match canvas dimensions to video
        faceapi.matchDimensions(canvas, {
          width: 320,
          height: 240
        })

        const resized = faceapi.resizeResults(detections, {
          width: 320,
          height: 240
        })

        // Draw face detection overlays
        faceapi.draw.drawDetections(canvas, resized)
        faceapi.draw.drawFaceExpressions(canvas, resized, 0.05)

        // Update avatar emotion based on detected expression
        if (detections.length > 0) {
          const emotion = mapFaceApiToAvatar(detections[0].expressions)
          setDetectedEmotion(emotion)
          onEmotionDetected(emotion)
        }
      }
    }, 100) // Check every 100ms for smooth detection
  }

  // Stop detection loop
  const stopDetectionLoop = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }

  // Initialize models when component mounts
  useEffect(() => {
    loadModels()
    return () => {
      stopDetectionLoop()
      stopVideo()
    }
  }, [])

  // Handle activation/deactivation
  useEffect(() => {
    if (isActive && isModelLoaded) {
      startVideo()
      faceDetectionLoop()
    } else if (!isActive) {
      stopDetectionLoop()
      stopVideo()
    }

    return () => {
      stopDetectionLoop()
    }
  }, [isActive, isModelLoaded])

  if (!isActive) return null

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '10px',
      color: 'white'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Face Tracking</h3>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="320"
          height="240"
          style={{ borderRadius: '8px' }}
        />
        <canvas
          ref={canvasRef}
          width="320"
          height="240"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '8px'
          }}
        />
      </div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        Status: {isModelLoaded ? 'Active' : 'Loading models...'}
        <br />
        Detected: <strong>{detectedEmotion}</strong>
      </div>
    </div>
  )
}