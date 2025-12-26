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
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
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
          A place where I push all the cool stuff I build. I code and sometimes I vibe-code XD.
          </p>
        </section>
        <section id="about" className="panel">
          <h3>About</h3>
          <p>
            I'm Raghav, a software developer. I love to code, and I love watching things move, break, and eventually work. This site is a collection of some cool stuff, some questionable experiments, and a few things that exist purely because I wanted to build them.
          </p>
          <p>
            I started out as a Mechanical Engineering student at BITS Pilani, but at some point I realised I was spending more time reading tech and coding than learning stress-strain curves. Since then, I've been building anything and everything, from implementing ML models and python scripts to full-stack apps and websites, and learning how systems work.
          </p>
          <p>
            I enjoy the entire journey-from "this should be easy" to "why is this not working" to "oh wow, that finally works." I care about clean code, solid architecture, and that small dopamine hit when a feature works exactly the way it should.
          </p>
          <p>
            In fact, the idea of building this site and putting everything online was simply to know if I can point some DNS records, letting requests traverse the internet, resolve through CDNs, and render cleanly in a browser somewhere, and then see how it goes.
          </p>
          <p><em>And if you're reading this, it worked and it's going pretty well *wink wink*.</em></p>
        </section>
        <section id="work" className="panel">
          <h3>Work</h3>
          <p>
            For now, Imma hard-code “Loading…” here while I quietly organise my GitHub.
          </p>
          <p>
            Till then you can find me on <a href="https://www.linkedin.com/in/raghav-sharma-8a126434b/" target="_blank" rel="noopener noreferrer">LinkedIn</a> or <a href="mailto:raghavsharma.070901@gmail.com">Email</a>.
          </p>

        </section>
        <section id="contact" className="panel">
          <h3>Contact</h3>
          <div className="contact-info">
            <a href="mailto:raghavsharma.070901@gmail.com" className="contact-item">
              <span className="contact-label">Email</span>
              <span className="contact-value">raghavsharma.070901@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/raghav-sharma-8a126434b/" target="_blank" rel="noopener noreferrer" className="contact-item">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">linkedin.com/in/raghav-sharma</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

