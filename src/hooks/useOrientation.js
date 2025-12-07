import { useState, useEffect } from 'react'

export function useOrientation() {
    const [orientation, setOrientation] = useState({
        angle: 0,
        type: 'portrait-primary',
        isPortrait: true,
        isLandscape: false
    })

    useEffect(() => {
        const updateOrientation = () => {
            const screenOrientation = window.screen?.orientation || {}
            const angle = screenOrientation.angle || window.orientation || 0
            const type = screenOrientation.type || 'portrait-primary'

            const isPortrait = type.includes('portrait') || Math.abs(angle) === 0 || Math.abs(angle) === 180
            const isLandscape = type.includes('landscape') || Math.abs(angle) === 90 || Math.abs(angle) === 270

            setOrientation({
                angle,
                type,
                isPortrait,
                isLandscape
            })
        }

        updateOrientation()

        window.addEventListener('orientationchange', updateOrientation)

        // Modern API
        if (window.screen?.orientation) {
            window.screen.orientation.addEventListener('change', updateOrientation)
        }

        return () => {
            window.removeEventListener('orientationchange', updateOrientation)
            if (window.screen?.orientation) {
                window.screen.orientation.removeEventListener('change', updateOrientation)
            }
        }
    }, [])

    return orientation
}
