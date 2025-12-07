import React, { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* 
   ULTRA-RESPONSIVE SOLAR SYSTEM
   Optimized for all devices: phones, foldables, tablets, desktop
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

            <mesh scale={1.15}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#fde047"
                    transparent
                    opacity={0.4}
                    side={THREE.BackSide}
                />
            </mesh>

            <mesh ref={glowRef} scale={1.3}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#fef3c7"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            <Sparkles
                count={80}
                scale={5}
                size={8}
                speed={0.3}
                opacity={0.8}
                color="#fef3c7"
            />

            <pointLight
                position={[0, 0, 0]}
                intensity={4}
                distance={100}
                decay={1.5}
                color="#fff7ed"
                castShadow
            />

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

function AsteroidBelt({ count }) {
    const points = useMemo(() => {
        const particles = []
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 8 + Math.random() * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = (Math.random() - 0.5) * 0.5
            particles.push(x, y, z)
        }
        return new Float32Array(particles)
    }, [count])

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

function SolarSystem({ deviceType }) {
    const scale = deviceType === 'mobile' ? 0.5 : deviceType === 'small' ? 0.4 : 1

    return (
        <group rotation={[0.1, 0, 0]} scale={scale}>
            <Sun />

            <Planet distance={3} size={0.12} color="#A1A1AA" speed={2} emissive="#52525B" emissiveIntensity={0.1} />
            <Planet distance={4} size={0.18} color="#E4E4E7" speed={1.6} emissive="#fef3c7" emissiveIntensity={0.2} />
            <Planet distance={5.5} size={0.2} color="#3b82f6" speed={1.2} emissive="#60a5fa" emissiveIntensity={0.3} />
            <Planet distance={7} size={0.15} color="#dc2626" speed={1} emissive="#7c2d12" emissiveIntensity={0.1} />

            <AsteroidBelt count={deviceType === 'mobile' ? 1000 : 2000} />

            <Planet distance={11} size={0.7} color="#d4d4d8" speed={0.5} zVariance={0.8} />
            <Planet distance={15} size={0.6} color="#FCD34D" speed={0.35} rings={true} />
            <Planet distance={19} size={0.4} color="#67e8f9" speed={0.2} emissive="#06b6d4" emissiveIntensity={0.2} />
        </group>
    )
}

function StarField({ deviceType }) {
    const starCount = deviceType === 'small' ? 2000 : deviceType === 'mobile' ? 4000 : 8000

    return (
        <Stars
            radius={deviceType === 'mobile' ? 80 : 120}
            depth={deviceType === 'mobile' ? 50 : 80}
            count={starCount}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
        />
    )
}

function ResponsiveCamera({ deviceType }) {
    const { camera } = useThree()

    useEffect(() => {
        if (deviceType === 'small') {
            camera.position.set(0, 20, 24)
            camera.fov = 70
        } else if (deviceType === 'mobile') {
            camera.position.set(0, 16, 20)
            camera.fov = 60
        } else {
            camera.position.set(0, 12, 16)
            camera.fov = 50
        }
        camera.updateProjectionMatrix()
    }, [deviceType, camera])

    return null
}

function Scene({ mousePos, deviceType }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return

        const sensitivity = deviceType === 'small' ? 0.05 : deviceType === 'mobile' ? 0.08 : 0.15
        const targetX = mousePos.current.y * sensitivity
        const targetY = mousePos.current.x * sensitivity

        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta * 0.5
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * delta * 0.5
    })

    return (
        <group ref={groupRef}>
            <SolarSystem deviceType={deviceType} />
            <StarField deviceType={deviceType} />
        </group>
    )
}

export default function Background3D() {
    const mousePos = useRef({ x: 0, y: 0 })
    const [deviceType, setDeviceType] = useState('desktop')

    useEffect(() => {
        const updateDeviceType = () => {
            const width = window.innerWidth
            if (width < 380) {
                setDeviceType('small') // Foldables, small phones
            } else if (width < 768) {
                setDeviceType('mobile') // Regular phones
            } else {
                setDeviceType('desktop')
            }
        }

        updateDeviceType()
        window.addEventListener('resize', updateDeviceType)
        window.addEventListener('orientationchange', updateDeviceType)

        return () => {
            window.removeEventListener('resize', updateDeviceType)
            window.removeEventListener('orientationchange', updateDeviceType)
        }
    }, [])

    const handleMouseMove = (e) => {
        mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0]
            mousePos.current.x = (touch.clientX / window.innerWidth) * 2 - 1
            mousePos.current.y = -(touch.clientY / window.innerHeight) * 2 + 1
        }
    }

    const pixelRatio = deviceType === 'small' ? [1, 1] : deviceType === 'mobile' ? [1, 1.5] : [1, 2]

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                width: '100dvw',
                height: '100vh',
                height: '100dvh',
                zIndex: -1,
                background: 'radial-gradient(ellipse at center, #18181b 0%, #09090b 100%)',
                pointerEvents: 'none'
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            <Canvas
                camera={{ position: [0, 12, 16], fov: 50 }}
                gl={{
                    antialias: deviceType !== 'small',
                    alpha: true,
                    powerPreference: deviceType === 'desktop' ? 'high-performance' : 'low-power',
                    pixelRatio: window.devicePixelRatio
                }}
                shadows={deviceType === 'desktop'}
                dpr={pixelRatio}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.03} color="#1e293b" />
                    <hemisphereLight
                        skyColor="#1e293b"
                        groundColor="#020617"
                        intensity={0.1}
                    />

                    <ResponsiveCamera deviceType={deviceType} />
                    <Scene mousePos={mousePos} deviceType={deviceType} />
                </Suspense>
            </Canvas>
        </div>
    )
}
