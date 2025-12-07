import { useEffect, useRef, useCallback } from 'react'

export function useTouchGestures(elementRef, callbacks = {}) {
    const touchStart = useRef({ x: 0, y: 0, time: 0 })
    const touchEnd = useRef({ x: 0, y: 0, time: 0 })
    const initialDistance = useRef(0)
    const currentScale = useRef(1)

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0]
        touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        }

        // Handle pinch start
        if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            initialDistance.current = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )

            if (callbacks.onPinchStart) {
                callbacks.onPinchStart({ scale: currentScale.current })
            }
        }

        if (callbacks.onTouchStart) {
            callbacks.onTouchStart(e)
        }
    }, [callbacks])

    const handleTouchMove = useCallback((e) => {
        // Handle pinch zoom
        if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )

            const scale = currentDistance / initialDistance.current
            currentScale.current = scale

            if (callbacks.onPinch) {
                callbacks.onPinch({ scale, distance: currentDistance })
            }
        }

        if (callbacks.onTouchMove) {
            callbacks.onTouchMove(e)
        }
    }, [callbacks])

    const handleTouchEnd = useCallback((e) => {
        const touch = e.changedTouches[0]
        touchEnd.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        }

        // Calculate swipe
        const deltaX = touchEnd.current.x - touchStart.current.x
        const deltaY = touchEnd.current.y - touchStart.current.y
        const deltaTime = touchEnd.current.time - touchStart.current.time

        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        // Swipe detection (minimum 50px, maximum 1000ms)
        if (deltaTime < 1000 && (absX > 50 || absY > 50)) {
            const direction = absX > absY
                ? (deltaX > 0 ? 'right' : 'left')
                : (deltaY > 0 ? 'down' : 'up')

            const velocity = Math.max(absX, absY) / deltaTime

            if (callbacks.onSwipe) {
                callbacks.onSwipe({ direction, deltaX, deltaY, velocity })
            }
        }

        // Tap detection (quick touch, minimal movement)
        else if (deltaTime < 300 && absX < 10 && absY < 10) {
            if (callbacks.onTap) {
                callbacks.onTap({ x: touch.clientX, y: touch.clientY })
            }
        }

        // Reset pinch
        if (e.touches.length < 2) {
            initialDistance.current = 0

            if (callbacks.onPinchEnd) {
                callbacks.onPinchEnd({ scale: currentScale.current })
            }
        }

        if (callbacks.onTouchEnd) {
            callbacks.onTouchEnd(e)
        }
    }, [callbacks])

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        // Passive listeners for better scroll performance
        const options = { passive: false }

        element.addEventListener('touchstart', handleTouchStart, options)
        element.addEventListener('touchmove', handleTouchMove, options)
        element.addEventListener('touchend', handleTouchEnd, options)

        return () => {
            element.removeEventListener('touchstart', handleTouchStart)
            element.removeEventListener('touchmove', handleTouchMove)
            element.removeEventListener('touchend', handleTouchEnd)
        }
    }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd])

    return {
        currentScale: currentScale.current
    }
}
