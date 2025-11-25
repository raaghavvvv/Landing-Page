import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";

export default function Scene() {
  const textRef = useRef();

  useFrame((state) => {
    if (!textRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Constant random organic movement
    // Random-looking rotation combining multiple sine waves
    textRef.current.rotation.y = 
      Math.sin(time * 0.3) * 0.05 + 
      Math.sin(time * 0.47) * 0.03 + 
      Math.cos(time * 0.23) * 0.02;
    
    // Random-looking float with multiple frequencies
    textRef.current.position.y = 
      Math.sin(time * 0.4) * 0.02 + 
      Math.cos(time * 0.57) * -0.5 + 
      Math.sin(time * 0.31) * 0.01;
    
    // Slight random X-axis tilt
    textRef.current.rotation.x = 
      Math.sin(time * 0.35) * 0.2 + 
      Math.cos(time * 0.19) * 0.015;
  });

  return (
    <Center>
      <group ref={textRef}>
        {/* Main title */}
        <Text3D
          font="/fonts/optimer_regular.typeface.json"
          size={0.6}
          height={0.15}
          bevelEnabled
          bevelThickness={0.015}
          bevelSize={0.02}
          bevelSegments={5}
          curveSegments={12}
          position={[0, 0.3, 0]}
        >
          Hola Friend! I'M RAGHAV
          <meshStandardMaterial 
            metalness={0.9} 
            roughness={0.5} 
            color="#00d4ff"
            emissive="#003344"
            emissiveIntensity={0.2}
          />
        </Text3D>

        {/* Subtitle */}
        <Text3D
          font="/fonts/optimer_regular.typeface.json"
          size={0.3}
          height={0.08}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.01}
          bevelSegments={3}
          curveSegments={8}
          position={[0.05, -0.2, 0]}
        >
          Look what I built! Grab the dart and aim to explore.
          <meshStandardMaterial 
            metalness={0.9} 
            roughness={0.5} 
            color="#4fc3f7"
            emissive="#002233"
            emissiveIntensity={0.15}
          />
        </Text3D>
      </group>
    </Center>
  );
}

