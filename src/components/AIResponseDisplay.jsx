import React, { useState, useEffect, useRef } from 'react';

const AIResponseDisplay = ({ responses = [], onSpeakingStateChange }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Text-to-speech function
  const speakText = (text, emotion = 'neutral') => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice based on emotion
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Adjust speech parameters based on emotion
    switch (emotion) {
      case 'happy':
      case 'excited':
        utterance.rate = 1.1;
        utterance.pitch = 2.0;
        utterance.volume = 0.9;
        break;
      case 'sad':
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        break;
      case 'angry':
        utterance.rate = 1.2;
        utterance.pitch = 0.9;
        utterance.volume = 0.9;
        break;
      case 'surprised':
        utterance.rate = 1.0;
        utterance.pitch = 1.3;
        utterance.volume = 0.8;
        break;
      case 'thinking':
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onSpeakingStateChange) onSpeakingStateChange(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeakingStateChange) onSpeakingStateChange(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onSpeakingStateChange) onSpeakingStateChange(false);
    };
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech function
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (onSpeakingStateChange) onSpeakingStateChange(false);
  };

  // Auto-speak new AI responses
  useEffect(() => {
    if (responses.length > 0) {
      const latestResponse = responses[responses.length - 1];
      if (latestResponse && !latestResponse.isError && latestResponse.aiResponse) {
        // Delay speech slightly to allow animation to start
        setTimeout(() => {
          speakText(latestResponse.aiResponse, latestResponse.aiEmotion);
        }, 500);
      }
    }
  }, [responses.length, speechEnabled]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responses]);

  // Auto-expand when new response comes in
  useEffect(() => {
    if (responses.length > 0 && isMinimized) {
      setIsMinimized(false);
    }
  }, [responses.length]);

  const clearResponses = () => {
    // This would need to be handled by parent component
    if (window.clearAIResponses) {
      window.clearAIResponses();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1001
      }}>
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            padding: '12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Show AI Responses"
        >
          💬
        </button>
        {responses.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {responses.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1001,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>🤖 AI Friend Responses</h3>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {responses.length} conversation{responses.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            style={{
              padding: '4px 8px',
              background: speechEnabled ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title={speechEnabled ? 'Disable speech' : 'Enable speech'}
          >
            {speechEnabled ? '🔊' : '🔇'}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              style={{
                padding: '4px 8px',
                background: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Stop speaking"
            >
              ⏸️
            </button>
          )}
          <button
            onClick={clearResponses}
            style={{
              padding: '4px 8px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Clear all responses"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '4px 8px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Minimize"
          >
            ➖
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {responses.length === 0 ? (
          <div style={{
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: '14px',
            padding: '20px'
          }}>
            Start talking to see your AI friend's responses here!
          </div>
        ) : (
          responses.map((response, index) => (
            <div key={index} style={{
              background: response.isError ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              border: response.isError ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}>
              {/* User Speech */}
              <div style={{
                marginBottom: '8px',
                padding: '8px 12px',
                background: 'rgba(33, 150, 243, 0.2)',
                borderRadius: '8px',
                borderLeft: '3px solid #2196F3'
              }}>
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>You said (feeling {response.emotion}):</span>
                  <span>{formatTime(response.timestamp)}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
                  "{response.userSpeech}"
                </div>
              </div>

              {/* AI Response */}
              <div style={{
                padding: '8px 12px',
                background: response.isError ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                borderRadius: '8px',
                borderLeft: response.isError ? '3px solid #f44336' : '3px solid #4CAF50'
              }}>
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>AI Friend responds:</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {response.animation && (
                      <span>🎭 {response.animation.replace('.fbx', '')}</span>
                    )}
                    {isSpeaking && index === responses.length - 1 && (
                      <span style={{ color: '#4CAF50' }}>🗣️ Speaking...</span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: response.isError ? '#ffcdd2' : 'white'
                }}>
                  {response.aiResponse}
                </div>
                {response.aiEmotion && (
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.6,
                    marginTop: '4px'
                  }}>
                    AI Emotion: {response.aiEmotion}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 15px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center'
      }}>
        💡 Your AI friend responds with voice and emotions
        {speechEnabled && !('speechSynthesis' in window) && (
          <div style={{ color: '#f44336', marginTop: '4px' }}>
            ⚠️ Text-to-speech not supported in this browser
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponseDisplay;