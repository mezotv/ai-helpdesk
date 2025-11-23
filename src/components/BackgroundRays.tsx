"use client";

import LightRays from './LightRays';

export default function BackgroundRays() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
    </div>
  );
}

