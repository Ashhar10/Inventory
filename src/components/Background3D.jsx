
import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Gear } from './3d/Gear'
import { Environment, Float, Stars } from '@react-three/drei'

function Scene({ mousePos }) {
    const groupRef = useRef()

    useFrame((state) => {
        // Parallax effect based on mouse position
        const x = (mousePos.current.x * state.viewport.width) / 100
        const y = (mousePos.current.y * state.viewport.height) / 100

        // Smoothly interpolate rotation
        groupRef.current.rotation.x += 0.001
        groupRef.current.rotation.y += 0.001

        // Tilt scene towards mouse
        groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.05 + (y * 0.05)
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + (x * 0.05)
    })

    return (
        <group ref={groupRef}>
            {/* Background Gears (Darker, Slower) */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Gear position={[-8, 5, -10]} size={3} color="#333" speed={0.2} toothCount={12} thickness={1} />
                <Gear position={[8, -5, -8]} size={4} color="#2a2a2a" speed={-0.15} toothCount={16} thickness={1} />
                <Gear position={[0, 0, -15]} size={6} color="#222" speed={0.1} toothCount={20} thickness={2} />
            </Float>

            {/* Foreground Gears (Orange Accents, Faster) */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* Top Left Cluster */}
                <Gear position={[-6, 2, -2]} size={1.2} color="#FC6E20" speed={0.5} />
                <Gear position={[-4.5, 3, -4]} size={0.8} color="#e65a10" speed={-0.8} />

                {/* Bottom Right Cluster */}
                <Gear position={[5, -2, -1]} size={1.5} color="#FC6E20" speed={-0.4} />
                <Gear position={[6.5, -3.5, -3]} size={1} color="#c2410c" speed={0.6} />

                {/* Random Floating Parts */}
                <FeatureCylinder position={[3, 3, -5]} color="#444" />
                <FeatureCylinder position={[-3, -3, -6]} color="#444" />
            </Float>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

function FeatureCylinder({ position, color }) {
    // Just some decorative mechanical bits
    return (
        <mesh position={position} rotation={[Math.random(), Math.random(), 0]}>
            <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
    )
}

export default function Background3D() {
    const mousePos = useRef({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        // Normalize mouse position from -1 to 1
        mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                background: '#1B1B1B', // Dark base
                pointerEvents: 'none' // Click through to app
            }}
            onMouseMove={handleMouseMove}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#FC6E20" />
                    <pointLight position={[-10, -10, 10]} intensity={0.5} color="#4f46e5" />
                    <Scene mousePos={mousePos} />
                    {/* Environment reflection for metallic look */}
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    )
}
