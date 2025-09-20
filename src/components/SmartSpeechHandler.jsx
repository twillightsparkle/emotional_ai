import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/GeminiService';

const SmartSpeechHandler = ({ currentEmotion, onGeminiResponse, onEmotionChange, onAnimationChange, onEmotionReset }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('Ready to talk to your AI friend');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setStatus('🎤 Listening... speak to your AI friend');
      setIsRecording(true);
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update transcription with final results
      if (finalTranscript) {
        const newTranscription = transcription + finalTranscript + ' ';
        setTranscription(newTranscription);
        
        // Reset silence timeout when we get speech
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          // After 2 seconds of silence, process the speech
          processTranscription(newTranscription.trim());
        }, 2000);
      }
      
      // Show interim results
      if (interimTranscript) {
        setStatus(`🎤 "${interimTranscript}"`);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setStatus('🤫 Waiting for you to speak...');
      } else if (event.error === 'aborted') {
        setStatus('Recording stopped');
        setIsRecording(false);
      } else {
        setStatus(`Error: ${event.error}`);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      // Don't auto-restart - user must manually start recording again
      setIsRecording(false);
      setStatus('Ready to talk to your AI friend');
    };
    
    return recognition;
  };

  // Process the transcription and send to Gemini
  const processTranscription = async (text) => {
    if (!text || text.trim() === '' || isProcessing) return;
    
    setIsProcessing(true);
    setStatus('🤖 Your AI friend is thinking...');
    
    // Stop recording while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    try {
        console.log('Current emotion sent to Gemini:', currentEmotion);
      const response = await geminiService.respondAsFriend(text, currentEmotion);
      
      // Handle structured response
      const responseData = {
        userSpeech: text,
        aiResponse: response.text || response, // Support both structured and plain text responses
        aiEmotion: response.emotion || 'neutral',
        animation: response.animation || 'Idle.fbx',
        timestamp: new Date().toISOString()
      };

      // Trigger emotion change if callback provided
      if (onEmotionChange && responseData.aiEmotion) {
        onEmotionChange(responseData.aiEmotion);
      }
      
      // Trigger animation change if callback provided
      if (onAnimationChange && response.animation) {
        onAnimationChange(response.animation);
      }
      
      // Call the callback to display the response
      if (onGeminiResponse) {
        onGeminiResponse(responseData);
      }
      
      setStatus('✅ Response received! Ready for more conversation');
      setTranscription(''); // Clear for next input
      
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      setStatus(`❌ Error: ${error.message}`);
      
      if (onGeminiResponse) {
        onGeminiResponse({
          userSpeech: text,
          emotion: currentEmotion,
          aiResponse: `Sorry, I had trouble responding. Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        });
      }
    } finally {
      setIsProcessing(false);
      
      // Reset emotions to neutral after conversation with a delay
      // This allows the animation and AI emotion to be displayed briefly
      setTimeout(() => {
        if (onEmotionReset) {
          onEmotionReset();
        }
      }, 9000); // 9 second delay to show the AI emotion/animation
      
      // Don't auto-restart recording - user must manually start again
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Initialize and start speech recognition
      const recognition = initializeSpeechRecognition();
      if (!recognition) return;
      
      recognitionRef.current = recognition;
      setTranscription('');
      clearTimeout(silenceTimeoutRef.current);
      recognition.start();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('❌ Error accessing microphone');
    }
  };

  const stopRecording = () => {
    setIsProcessing(false);
    clearTimeout(silenceTimeoutRef.current);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
    setStatus('Ready to talk to your AI friend');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '15px',
      color: 'white',
      textAlign: 'center',
      minWidth: '300px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
        🤖 AI Friend Chat
      </h3>
      
      <div style={{ 
        fontSize: '14px', 
        marginBottom: '15px',
        color: isProcessing ? '#FF9800' : isRecording ? '#4CAF50' : '#ccc'
      }}>
        {status}
      </div>

      {transcription && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          "{transcription}"
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            padding: '12px 24px',
            background: isRecording ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          {isRecording ? '🛑 Stop Talking' : '🎤 Start Talking'}
        </button>
      </div>

      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        marginTop: '10px'
      }}>
        Speak naturally - I'll respond based on what you say and how you feel!
      </div>
    </div>
  );
};

export default SmartSpeechHandler;