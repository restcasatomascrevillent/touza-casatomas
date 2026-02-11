
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const FloatingCrystal = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2} floatingRange={[-0.2, 0.2]}>
            <mesh ref={meshRef} scale={1.8}>
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    roughness={0.1}
                    transmission={0.95}
                    ior={1.45}
                    chromaticAberration={0.4}
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#e8f4f8"
                />
            </mesh>
        </Float>
    );
};

const BackgroundParticles = () => {
    return (
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    )
}

const Scene3D = () => {
    return (
        <div className="absolute inset-0 z-[0] opacity-70 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]} // Optimize for high DPI screens, capped at 2x
            >
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a90e2" />
                <BackgroundParticles />
                <FloatingCrystal />
                <Environment preset="city" blur={0.8} />
            </Canvas>
        </div>
    );
};

export default Scene3D;
