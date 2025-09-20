import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export function Background() {
  const texture = useLoader(TextureLoader, '/texture/Hirsipaviljonki_pieni.jpg')
  
  return (
    <mesh position={[0, 5, -10]} scale={[80, 48, 4]}>
      <planeGeometry />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        transparent={false}
      />
    </mesh>
  )
}