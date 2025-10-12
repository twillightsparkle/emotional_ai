import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export function Background() {
  const texture = useLoader(TextureLoader, '/texture/aito.jpg')
  
  return (
    <mesh position={[0, 0, -10]} scale={[47, 24, 2]}>
      <planeGeometry />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        transparent={false}
      />
    </mesh>
  )
}