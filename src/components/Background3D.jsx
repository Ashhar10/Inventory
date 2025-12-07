
import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Float } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'

function Galaxy({ mousePos }) {
    const ref = useRef()

    // Generate particles for spiral galaxy
    const particles = useMemo(() => {
        const temp = new Float32Array(5000 * 3)
        // Helper to generate spiral
        for (let i = 0; i < 5000; i++) {
            const i3 = i * 3
            const radius = Math.random() * Math.random() * 8 + 0.5 // concentration near center
            const spinAngle = radius * 2.5 // more spin further out
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3) // 3 arms

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5

            temp[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
            temp[i3 + 1] = (Math.random() - 0.5) * (radius * 0.2) + randomY // flatten disk
            temp[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
        }
        return temp
    }, [])

    useFrame((state, delta) => {
        // Constant cosmic rotation (very slow)
        ref.current.rotation.z += delta * 0.05

        // Mouse Tilt Interaction
        // Max tilt range
        const maxTilt = 0.5

        // Target rotation based on mouse position
        const targetX = mousePos.current.y * maxTilt
        const targetY = mousePos.current.x * maxTilt

        // Smoothly interpolate current rotation to target (Lerp)
        ref.current.rotation.x += (targetX - ref.current.rotation.x) * delta * 2
        ref.current.rotation.y += (targetY - ref.current.rotation.y) * delta * 2
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#FC6E20"
                    size={0.03}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={2} // AdditiveBlending
                />
            </Points>
        </group>
    )
}

function StarField() {
    return (
        <group>
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

function Scene({ mousePos }) {
    return (
        <group>
            {/* Main Galaxy - Orange/Warm */}
            <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
                <Galaxy mousePos={mousePos} />
            </Float>

            {/* Background stars */}
            <StarField />
        </group>
    )
}

export default function Background3D() {
    const mousePos = useRef({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        // Normalize mouse position: -1 to 1
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
                background: 'black', // Deep space black
                pointerEvents: 'none' // Click through to app
            }}
            onMouseMove={handleMouseMove}
        >
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <Suspense fallback={null}>
                    {/* Dark Blue ambient for space feel */}
                    <ambientLight intensity={0.1} color="#001133" />
                    <Scene mousePos={mousePos} />
                </Suspense>
            </Canvas>
        </div>
    )
}
