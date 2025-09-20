import { useFrame } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'

export function Model({ emotion = 'neutral', currentAnimation = 'Idle.fbx', isSpeaking = false }) {
  const { nodes, materials } = useGLTF('/model/68cdacbf7d1f36d5cd0d3a6f.glb')
  
  // Load all animations
  const idleAnimation = useFBX('/animation/Idle.fbx')
  const cheeringAnimation = useFBX('/animation/Cheering.fbx')
  const comfortingAnimation = useFBX('/animation/comforting.fbx')
  const danceAnimation = useFBX('/animation/dance.fbx')
  const greetAnimation = useFBX('/animation/greet.fbx')
  const thumbupAnimation = useFBX('/animation/thumbup.fbx')
  
  // Name the animations
  idleAnimation.animations[0].name = 'Idle'
  cheeringAnimation.animations[0].name = 'Cheering'
  comfortingAnimation.animations[0].name = 'comforting'
  danceAnimation.animations[0].name = 'dance'
  greetAnimation.animations[0].name = 'greet'
  thumbupAnimation.animations[0].name = 'thumbup'
  
  const group = useRef()
  const [previousAnimation, setPreviousAnimation] = useState('Idle')
  
  // Combine all animations
  const allAnimations = [
    idleAnimation.animations[0],
    cheeringAnimation.animations[0],
    comfortingAnimation.animations[0],
    danceAnimation.animations[0],
    greetAnimation.animations[0],
    thumbupAnimation.animations[0]
  ]
  
  const { actions } = useAnimations(allAnimations, group)
  
  // Define emotion presets using available morph targets
  const emotions = {
    neutral: {},
    happy: {
      mouthSmileLeft: 0.8,
      mouthSmileRight: 0.8,
      cheekSquintLeft: 0.5,
      cheekSquintRight: 0.5,
      eyeSquintLeft: 0.3,
      eyeSquintRight: 0.3
    },
    sad: {
      mouthFrownLeft: 0.7,
      mouthFrownRight: 0.7,
      browDownLeft: 0.6,
      browDownRight: 0.6,
      mouthLowerDownLeft: 0.4,
      mouthLowerDownRight: 0.4
    },
    surprised: {
      eyeWideLeft: 0.9,
      eyeWideRight: 0.9,
      browInnerUp: 0.8,
      browOuterUpLeft: 0.6,
      browOuterUpRight: 0.6,
      jawOpen: 0.6
    },
    angry: {
      browDownLeft: 0.9,
      browDownRight: 0.9,
      eyeSquintLeft: 0.8,
      eyeSquintRight: 0.8,
      mouthFrownLeft: 0.6,
      mouthFrownRight: 0.6,
      noseSneerLeft: 0.5,
      noseSneerRight: 0.5
    },
    disgusted: {
      noseSneerLeft: 0.8,
      noseSneerRight: 0.8,
      mouthUpperUpLeft: 0.7,
      mouthUpperUpRight: 0.7,
      eyeSquintLeft: 0.5,
      eyeSquintRight: 0.5
    },
    excited: {
      mouthSmileLeft: 1.0,
      mouthSmileRight: 1.0,
      eyeWideLeft: 0.7,
      eyeWideRight: 0.7,
      browInnerUp: 0.6,
      jawOpen: 0.4
    },
    thinking: {
      browInnerUp: 0.4,
      browDownLeft: 0.3,
      eyeLookUpLeft: 0.5,
      eyeLookUpRight: 0.5,
      mouthPucker: 0.3
    },
    confused: {
      browInnerUp: 0.6,
      browDownLeft: 0.4,
      browOuterUpRight: 0.5,
      mouthLeft: 0.3,
      eyeSquintLeft: 0.2
    },
    smirk: {
      mouthSmileRight: 0.8,
      mouthDimpleRight: 0.5,
      cheekSquintRight: 0.4,
      eyeSquintRight: 0.3
    },
    kiss: {
      mouthPucker: 0.9,
      mouthFunnel: 0.5,
      eyeSquintLeft: 0.3,
      eyeSquintRight: 0.3
    },
    wink: {
      eyeBlinkRight: 1.0,
      mouthSmileLeft: 0.6,
      mouthSmileRight: 0.6,
      cheekSquintRight: 0.7
    },
    shock: {
      eyeWideLeft: 1.0,
      eyeWideRight: 1.0,
      browInnerUp: 1.0,
      browOuterUpLeft: 0.8,
      browOuterUpRight: 0.8,
      jawOpen: 0.9,
      mouthFunnel: 0.4
    }
  }
  
  // Handle animation switching
  useEffect(() => {
    if (!actions) return
    
    // Get animation name without .fbx extension
    const animationName = currentAnimation.replace('.fbx', '')
    
    // Stop previous animation
    if (previousAnimation && actions[previousAnimation]) {
      actions[previousAnimation].fadeOut(0.5)
    }
    
    // Start new animation
    if (actions[animationName]) {
      actions[animationName].reset().fadeIn(0.5).play()
      setPreviousAnimation(animationName)
    } else {
      // Fallback to idle if animation not found
      if (actions.Idle) {
        actions.Idle.reset().fadeIn(0.5).play()
        setPreviousAnimation('Idle')
      }
    }
  }, [currentAnimation, actions, previousAnimation])

  // Start idle animation initially
  useEffect(() => {
    if (actions.Idle) {
      actions.Idle.reset().play()
      setPreviousAnimation('Idle')
    }
  }, [actions])

  // Apply emotion to morph targets
  useFrame((state) => {
    const headNode = nodes.Wolf3D_Head
    
    if (headNode && headNode.morphTargetDictionary && headNode.morphTargetInfluences) {
      // Reset all morph targets to 0
      headNode.morphTargetInfluences.fill(0)
      
      // Apply current emotion
      const currentEmotion = emotions[emotion] || emotions.neutral
      
      Object.entries(currentEmotion).forEach(([morphName, value]) => {
        const targetIndex = headNode.morphTargetDictionary[morphName]
        if (targetIndex !== undefined) {
          headNode.morphTargetInfluences[targetIndex] = value
        }
      })
      
      // Add mouth movement when speaking
      if (isSpeaking) {
        const time = state.clock.elapsedTime
        
        // Create random mouth movements for speech
        const mouthOpenAmount = (Math.sin(time * 8) + Math.sin(time * 12) + Math.sin(time * 16)) * 0.1 + 0.2
        const mouthWideAmount = Math.sin(time * 6) * 0.05
        
        // Apply mouth movements
        const jawOpenIndex = headNode.morphTargetDictionary['jawOpen']
        const mouthFunnelIndex = headNode.morphTargetDictionary['mouthFunnel']
        const mouthPuckerIndex = headNode.morphTargetDictionary['mouthPucker']
        
        if (jawOpenIndex !== undefined) {
          headNode.morphTargetInfluences[jawOpenIndex] = Math.max(0, Math.min(1, mouthOpenAmount))
        }
        
        if (mouthFunnelIndex !== undefined) {
          headNode.morphTargetInfluences[mouthFunnelIndex] = Math.max(0, Math.min(1, mouthWideAmount))
        }
        
        if (mouthPuckerIndex !== undefined) {
          headNode.morphTargetInfluences[mouthPuckerIndex] = Math.max(0, Math.min(1, -mouthWideAmount))
        }
      }
    }
  })

  return (
    <group ref={group} scale={[6, 6, 6]} position={[0, -8, 0]} dispose={null}>
      <primitive object={nodes.Hips || nodes.Root || Object.values(nodes)[0]} />
      {/* Render all skinned meshes */}
      {Object.keys(nodes).map(key => {
        const node = nodes[key]
        if (node.isSkinnedMesh) {
          return (
            <skinnedMesh
              key={key}
              name={key}
              geometry={node.geometry}
              material={materials[node.material?.name] || node.material}
              skeleton={node.skeleton}
              morphTargetDictionary={node.morphTargetDictionary}
              morphTargetInfluences={node.morphTargetInfluences}
            />
          )
        }
        return null
      })}
    </group>
  )
}