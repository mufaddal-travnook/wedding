// app/components/models/Man.jsx
import React from 'react'
import { useGLTF } from '@react-three/drei'

// Change to named export to match how Scene.jsx imports it
export function Man(props) {
  // Ensure this points to your file path. 
  // If it is inside public/models, use '/models/man-transformed.glb'
  const { nodes, materials } = useGLTF('/man-transformed.glb')
  
  return (
    <group {...props} dispose={null}>
      <mesh 
        geometry={nodes.Object_5.geometry} 
        material={materials.Material_0} 
        position={[-0.341, -0.951, -0.252]} // RESTORED original internal offset
        scale={1} 
      />
    </group>
  )
}

useGLTF.preload('/man-transformed.glb')
