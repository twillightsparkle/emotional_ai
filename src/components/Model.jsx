import { useFrame } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'

export function Model({ emotion = 'neutral' }) {
  const { nodes, materials } = useGLTF('/model/68cdacbf7d1f36d5cd0d3a6f.glb')
  const { animations: idleAnimation } = useFBX('/animation/Idle.fbx')
  
  idleAnimation[0].name = 'Idle'
  
  const group = useRef()
  const { actions } = useAnimations([idleAnimation[0]], group)
  
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
  
  // Start idle animation
  useEffect(() => {
    if (actions.Idle) {
      actions.Idle.reset().play()
    }
  }, [actions])

  // Apply emotion to morph targets
  useFrame(() => {
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