import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";
import DartGame from "./DartGame";
import "../styles/LandingPage.css";

export default function LandingPage() {
  return (
    <div className="app">
      <header className="banner">
        <div className="banner-content">
          <div className="banner-canvas">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#ff6b9d" />
              <pointLight position={[0, -2, 4]} intensity={0.8} color="#4fc3f7" />
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
              <OrbitControls 
                enableZoom={true}
                enablePan={false}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.3}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 1.8}
                minAzimuthAngle={-Math.PI / 6}
                maxAzimuthAngle={Math.PI / 6}
                minDistance={2}
                maxDistance={15}
              />
            </Canvas>
          </div>
          <DartGame />
        </div>
      </header>

      {/* Main Content */}
      <main className="content">
        <section className="hero">
          <p className="hero-tag">A full stack developer</p>
          <h1>Welcome to my world</h1>
          <p className="hero-subtitle">
          A place where I push all the cool stuff I build. Sometimes I code and sometimes I vibe-code XD.
          </p>
        </section>
        <section id="about" className="panel">
          <h3>About</h3>
          <p>
            Loading...
          </p>
        </section>
        <section id="work" className="panel">
          <h3>Work</h3>
          <p>
            Loading...
          </p>
        </section>
        <section id="contact" className="panel">
          <h3>Contact</h3>
          <p>
            Loading...
          </p>
        </section>
      </main>
    </div>
  );
}

