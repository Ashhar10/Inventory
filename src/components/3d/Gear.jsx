
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function Gear({ position = [0, 0, 0], color = '#FC6E20', speed = 1, size = 1, toothCount = 8, thickness = 0.5 }) {
    const meshRef = useRef()

    // Rotate the gear
    useFrame((state, delta) => {
        meshRef.current.rotation.z += delta * speed * 0.5
    })

    const teeth = Array.from({ length: toothCount }, (_, i) => {
        const angle = (i / toothCount) * Math.PI * 2
        return (
            <mesh
                key={i}
                position={[
                    Math.cos(angle) * (size * 0.9),
                    Math.sin(angle) * (size * 0.9),
                    0
                ]}
                rotation={[0, 0, angle]}
            >
                <boxGeometry args={[size * 0.3, size * 0.2, thickness]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
            </mesh>
        )
    })

    return (
        <group ref={meshRef} position={position}>
            {/* Main Disk */}
            <mesh>
                <cylinderGeometry args={[size * 0.8, size * 0.8, thickness, 32]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Inner Hole (Visual trick using a darker cylinder) */}
            <mesh position={[0, 0, 0.01]}>
                <cylinderGeometry args={[size * 0.3, size * 0.3, thickness + 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>

            {/* Teeth */}
            {teeth}
        </group>
    )
}
