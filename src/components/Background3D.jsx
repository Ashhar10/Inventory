
import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Float, Sparkles, OrbitControls } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import * as THREE from 'three'

/* 
   SOLAR SYSTEM ENGINE - IOS 26 THEME
   - Replaces Galaxy with realistic Solar System
   - Interactive Sun with sparking lights
   - Orbiting Planets
*/

function Sun() {
    return (
        <group>
            {/* The Sun Body */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial
                    emissive="#FCD34D"
                    emissiveIntensity={2}
                    color="#FCD34D"
                    toneMapped={false}
                />
            </mesh>
            {/* Sun Glow/Atmosphere */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
            </mesh>
            {/* Sparking Lights (Solar Flares) */}
            <Sparkles count={50} scale={4} size={6} speed={0.4} opacity={1} color="#fbbf24" />

            {/* Main Light Source */}
            <pointLight intensity={2} distance={100} decay={2} color="#fff7ed" />
        </group>
    )
}

function Planet({ distance, size, color, speed, zVariance = 0, name }) {
    const ref = useRef()
    const angle = useRef(Math.random() * Math.PI * 2)

    useFrame((state, delta) => {
        angle.current += speed * delta
        ref.current.position.x = Math.cos(angle.current) * distance
        ref.current.position.z = Math.sin(angle.current) * distance + Math.sin(angle.current * 3) * zVariance
        ref.current.rotation.y += delta // Self rotation
    })

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.7}
                    metalness={0.2}
                />
            </mesh>
            {/* Orbit Trail (Optional, simple ring) */}
            {/* To keep it optimized we don't render full orbit lines for everything */}
        </group>
    )
}

function SolarSystem({ mousePos }) {
    return (
        <group rotation={[0.2, 0, 0]}>
            <Sun />

            {/* Mercury-like */}
            <Planet distance={2.5} size={0.1} color="#A1A1AA" speed={1.5} name="Mercury" />

            {/* Venus-like (Gold/White) */}
            <Planet distance={3.5} size={0.15} color="#E4E4E7" speed={1.2} name="Venus" />

            {/* Earth-like (Blue/Slate) - Fits theme */}
            <Planet distance={5} size={0.18} color="#3b82f6" speed={1} name="Earth" />

            {/* Mars-like (Red/Rust) */}
            <Planet distance={7} size={0.12} color="#ef4444" speed={0.8} name="Mars" />

            {/* Jupiter-like (Giant) */}
            <Planet distance={10} size={0.6} color="#d4d4d8" speed={0.4} zVariance={1} name="Jupiter" />

            {/* Saturn-like (Rings) */}
            <group>
                <Planet distance={14} size={0.5} color="#FCD34D" speed={0.3} name="Saturn" />
                {/* Rings would go here simpler to just have the planet for optimization */}
            </group>
        </group>
    )
}

function StarField() {
    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        </group>
    )
}

function Scene({ mousePos }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        // Subtle tilt parallax
        const targetX = mousePos.current.y * 0.1
        const targetY = mousePos.current.x * 0.1

        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * delta
    })

    return (
        <group ref={groupRef}>
            <SolarSystem mousePos={mousePos} />
            <StarField />
        </group>
    )
}

export default function Background3D() {
    const mousePos = useRef({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
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
                background: '#09090B', // IOS 26 Abyss Black
                pointerEvents: 'none'
            }}
            onMouseMove={handleMouseMove}
        >
            <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
                <Suspense fallback={null}>
                    {/* Deep Space Lighting */}
                    <ambientLight intensity={0.05} />
                    <Scene mousePos={mousePos} />
                </Suspense>
            </Canvas>
        </div>
    )
}
