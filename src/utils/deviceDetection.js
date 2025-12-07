export function detectDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera

    return {
        // Operating System
        isIOS: /iPad|iPhone|iPod/.test(ua) && !window.MSStream,
        isAndroid: /android/i.test(ua),
        isWindows: /windows phone/i.test(ua),

        // Browser
        isSafari: /^((?!chrome|android).)*safari/i.test(ua),
        isChrome: /chrome/i.test(ua) && !/edge/i.test(ua),
        isFirefox: /firefox/i.test(ua),
        isEdge: /edg/i.test(ua),

        // Device Type
        isMobile: /mobile/i.test(ua),
        isTablet: /tablet|ipad/i.test(ua),

        // Specific Devices
        isIPhone: /iPhone/.test(ua),
        isIPad: /iPad/.test(ua),
        isSamsung: /samsung/i.test(ua),
        isHuawei: /huawei/i.test(ua),
        isXiaomi: /xiaomi|mi |redmi/i.test(ua),
        isOnePlus: /oneplus/i.test(ua),
        isPixel: /pixel/i.test(ua),

        // Capabilities
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasNotch: detectNotch(),
        hasFoldableScreen: detectFoldable(),

        // Performance
        gpuTier: detectGPUTier(),
        deviceMemory: navigator.deviceMemory || 4,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,

        // Display
        pixelRatio: window.devicePixelRatio || 1,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
    }
}

function detectNotch() {
    // iOS notch/Dynamic Island detection
    if (typeof window === 'undefined') return false

    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height

    // iPhone X and newer have notches
    return iPhone && (
        aspect > 0.46 || // Portrait
        CSS.supports('padding-top: env(safe-area-inset-top)')
    )
}

function detectFoldable() {
    if (typeof window === 'undefined') return false

    // Check for foldable screen spanning API
    return (
        window.matchMedia('(screen-spanning: single-fold-vertical)').matches ||
        window.matchMedia('(screen-spanning: single-fold-horizontal)').matches ||
        window.matchMedia('(screen-spanning: none)').matches
    )
}

function detectGPUTier() {
    // Simple GPU tier detection
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) return 'low'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

        // High-end GPUs
        if (/nvidia|geforce|radeon|amd|apple m[12]/i.test(renderer)) {
            return 'high'
        }

        // Mid-range
        if (/intel|adreno|mali-g/i.test(renderer)) {
            return 'medium'
        }
    }

    // Default to medium
    return 'medium'
}

export function getBrowserSupport() {
    return {
        webgl: !!document.createElement('canvas').getContext('webgl'),
        webgl2: !!document.createElement('canvas').getContext('webgl2'),
        webp: checkWebPSupport(),
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
        cssGrid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('--custom', '0')
    }
}

function checkWebPSupport() {
    const canvas = document.createElement('canvas')
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    return false
}

export function getPerformanceHints() {
    const device = detectDevice()

    return {
        // Reduce quality on low-end devices
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        lowPowerMode: device.gpuTier === 'low' || device.deviceMemory < 4,

        // Recommended settings
        recommendedStarCount: device.gpuTier === 'high' ? 8000 : device.gpuTier === 'medium' ? 4000 : 2000,
        recommendedShadows: device.gpuTier === 'high',
        recommendedAntialiasing: device.gpuTier !== 'low',
        recommendedPixelRatio: Math.min(device.pixelRatio, device.gpuTier === 'high' ? 2 : 1.5)
    }
}
