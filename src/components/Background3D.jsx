import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* 
   REALISTIC SOLAR SYSTEM - IOS 26 THEME
   Features:
   - Glowing Sun with volumetric lighting
   - Planets with realistic materials & lighting
   - Saturn with rings
   - Asteroid belt
   - Interactive mouse parallax
*/

function Sun() {
    const glowRef = useRef()

    useFrame((state) => {
        if (glowRef.current) {
            glowRef.current.rotation.z += 0.001
        }
    })

    return (
        <group>
            {/* Core Sun Body */}
            <mesh>
                <sphereGeometry args={[1.8, 64, 64]} />
                <meshStandardMaterial
                    emissive="#FCD34D"
                    emissiveIntensity={3}
                    color="#FBBF24"
                    toneMapped={false}
                    roughness={0.3}
                />
            </mesh>

            {/* Inner Glow Layer */}
            <mesh scale={1.15}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#fde047"
                    transparent
                    opacity={0.4}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer Glow/Corona */}
            <mesh ref={glowRef} scale={1.3}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#fef3c7"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Solar Flares/Sparkles */}
            <Sparkles
                count={80}
                scale={5}
                size={8}
                speed={0.3}
                opacity={0.8}
                color="#fef3c7"
            />

            {/* Main Sun Light - Illuminates all planets */}
            <pointLight
                position={[0, 0, 0]}
                intensity={4}
                distance={100}
                decay={1.5}
                color="#fff7ed"
                castShadow
            />

            {/* Ambient warm glow */}
            <pointLight
                position={[0, 0, 0]}
                intensity={1}
                distance={50}
                decay={2}
                color="#fbbf24"
            />
        </group>
    )
}

function Planet({
    distance,
    size,
    color,
    speed,
    zVariance = 0,
    emissive = '#000000',
    emissiveIntensity = 0,
    rings = false
}) {
    const planetRef = useRef()
    const angle = useRef(Math.random() * Math.PI * 2)

    useFrame((state, delta) => {
        angle.current += speed * delta * 0.5

        const x = Math.cos(angle.current) * distance
        const z = Math.sin(angle.current) * distance + Math.sin(angle.current * 2) * zVariance

        planetRef.current.position.x = x
        planetRef.current.position.z = z
        planetRef.current.rotation.y += delta * 0.5
    })

    return (
        <group ref={planetRef}>
            {/* Planet Body */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Optional Rings (Saturn) */}
            {rings && (
                <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                    <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
                    <meshStandardMaterial
                        color="#d4d4d8"
                        transparent
                        opacity={0.7}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            )}

            {/* Subtle atmosphere glow for Earth-like planets */}
            {emissiveIntensity > 0 && (
                <mesh scale={1.1}>
                    <sphereGeometry args={[size, 16, 16]} />
                    <meshBasicMaterial
                        color={emissive}
                        transparent
                        opacity={0.1}
                        side={THREE.BackSide}
                    />
                </mesh>
            )}
        </group>
    )
}

function AsteroidBelt() {
    const points = useMemo(() => {
        const particles = []
        for (let i = 0; i < 2000; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 8 + Math.random() * 2 // Between Mars and Jupiter
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = (Math.random() - 0.5) * 0.5
            particles.push(x, y, z)
        }
        return new Float32Array(particles)
    }, [])

    return (
        <Points positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#71717a"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    )
}

function SolarSystem() {
    return (
        <group rotation={[0.1, 0, 0]}>
            {/* The Sun */}
            <Sun />

            {/* Inner Planets */}
            <Planet
                distance={3}
                size={0.12}
                color="#A1A1AA"
                speed={2}
                emissive="#52525B"
                emissiveIntensity={0.1}
            /> {/* Mercury */}

            <Planet
                distance={4}
                size={0.18}
                color="#E4E4E7"
                speed={1.6}
                emissive="#fef3c7"
                emissiveIntensity={0.2}
            /> {/* Venus */}

            <Planet
                distance={5.5}
                size={0.2}
                color="#3b82f6"
                speed={1.2}
                emissive="#60a5fa"
                emissiveIntensity={0.3}
            /> {/* Earth */}

            <Planet
                distance={7}
                size={0.15}
                color="#dc2626"
                speed={1}
                emissive="#7c2d12"
                emissiveIntensity={0.1}
            /> {/* Mars */}

            {/* Asteroid Belt */}
            <AsteroidBelt />

            {/* Outer Planets */}
            <Planet
                distance={11}
                size={0.7}
                color="#d4d4d8"
                speed={0.5}
                zVariance={0.8}
            /> {/* Jupiter */}

            <Planet
                distance={15}
                size={0.6}
                color="#FCD34D"
                speed={0.35}
                rings={true}
            /> {/* Saturn with Rings */}

            <Planet
                distance={19}
                size={0.4}
                color="#67e8f9"
                speed={0.2}
                emissive="#06b6d4"
                emissiveIntensity={0.2}
            /> {/* Uranus */}
        </group>
    )
}

function StarField() {
    return (
        <Stars
            radius={120}
            depth={80}
            count={8000}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
        />
    )
}

function Scene({ mousePos }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return

        // Smooth mouse parallax
        const targetX = mousePos.current.y * 0.15
        const targetY = mousePos.current.x * 0.15

        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta * 0.5
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * delta * 0.5
    })

    return (
        <group ref={groupRef}>
            <SolarSystem />
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
                background: 'radial-gradient(ellipse at center, #18181b 0%, #09090b 100%)',
                pointerEvents: 'none'
            }}
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 12, 16], fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                shadows
            >
                <Suspense fallback={null}>
                    {/* Ambient lighting for deep space */}
                    <ambientLight intensity={0.03} color="#1e293b" />

                    {/* Subtle fill light from "distant stars" */}
                    <hemisphereLight
                        skyColor="#1e293b"
                        groundColor="#020617"
                        intensity={0.1}
                    />

                    <Scene mousePos={mousePos} />
                </Suspense>
            </Canvas>
        </div>
    )
}
