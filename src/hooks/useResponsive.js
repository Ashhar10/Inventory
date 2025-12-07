import { useState, useEffect } from 'react'

const breakpoints = {
    xs: 320,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1440,
    xxl: 1920
}

export function useResponsive() {
    const [viewport, setViewport] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isFoldable: false,
        isPortrait: true,
        breakpoint: 'lg'
    })

    useEffect(() => {
        const updateViewport = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            const isPortrait = height > width

            // Detect device type
            const isMobile = width < breakpoints.md
            const isTablet = width >= breakpoints.md && width < breakpoints.lg
            const isDesktop = width >= breakpoints.lg

            // Detect foldable (approximate)
            const isFoldable = (
                (width >= 768 && width <= 884) || // Galaxy Fold unfolded
                (width >= 280 && width <= 320) || // Galaxy Fold folded
                window.matchMedia('(screen-spanning: single-fold-horizontal)').matches ||
                window.matchMedia('(screen-spanning: single-fold-vertical)').matches
            )

            // Determine breakpoint
            let breakpoint = 'xs'
            if (width >= breakpoints.xxl) breakpoint = 'xxl'
            else if (width >= breakpoints.xl) breakpoint = 'xl'
            else if (width >= breakpoints.lg) breakpoint = 'lg'
            else if (width >= breakpoints.md) breakpoint = 'md'
            else if (width >= breakpoints.sm) breakpoint = 'sm'

            setViewport({
                width,
                height,
                isMobile,
                isTablet,
                isDesktop,
                isFoldable,
                isPortrait,
                breakpoint
            })
        }

        updateViewport()

        // Debounced resize handler
        let timeoutId
        const handleResize = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(updateViewport, 150)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', updateViewport)

        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', updateViewport)
        }
    }, [])

    return viewport
}

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        const listener = () => setMatches(media.matches)
        media.addEventListener('change', listener)

        return () => media.removeEventListener('change', listener)
    }, [matches, query])

    return matches
}
