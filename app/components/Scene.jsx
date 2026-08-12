// app/components/Scene.jsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Man } from './models/Man'; 

export default function Scene() {
  return (
    <div className="w-full h-screen bg-slate-900 relative">
      {/* Set a normal, closer starting zoom like [0, 0, 5] so they aren't tiny specs */}
      <Canvas camera={{ position:[0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        
        <Environment preset="city" />

        {/* Man 1: Positioned 1.5 units left */}
        <Man position={[-1.5, 0, 0]} />
        
        {/* Man 2: Positioned 1.5 units right */}
        <Man position={[1.5, 0, 0]} />

        <ContactShadows 
          position={[0, -1, 0]} // Pushed down slightly below the mesh baseline
          opacity={0.6} 
          scale={10} 
          blur={2} 
          far={4} 
        />

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>

      <p className="absolute bottom-5 left-5 text-white font-bold text-2xl z-10 pointer-events-none">
        HELLO
      </p>
    </div>
  );
}
