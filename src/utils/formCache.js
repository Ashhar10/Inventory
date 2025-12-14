// Form caching utility - auto-saves form data to localStorage with 24-hour expiry
// Prevents data loss on refresh or accidental form closure

const CACHE_EXPIRY_HOURS = 24
const CACHE_PREFIX = 'pwi_form_cache_'

export const formCache = {
    // Save form data to cache
    save: (formId, formData) => {
        try {
            const cacheData = {
                data: formData,
                timestamp: Date.now(),
                expiresAt: Date.now() + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000)
            }
            localStorage.setItem(`${CACHE_PREFIX}${formId}`, JSON.stringify(cacheData))
        } catch (error) {
            console.warn('Failed to cache form data:', error)
        }
    },

    // Load form data from cache
    load: (formId) => {
        try {
            const cached = localStorage.getItem(`${CACHE_PREFIX}${formId}`)
            if (!cached) return null

            const cacheData = JSON.parse(cached)

            // Check if cache has expired
            if (Date.now() > cacheData.expiresAt) {
                formCache.clear(formId)
                return null
            }

            return cacheData.data
        } catch (error) {
            console.warn('Failed to load cached form data:', error)
            return null
        }
    },

    // Clear specific form cache
    clear: (formId) => {
        try {
            localStorage.removeItem(`${CACHE_PREFIX}${formId}`)
        } catch (error) {
            console.warn('Failed to clear form cache:', error)
        }
    },

    // Clear all expired form caches
    clearExpired: () => {
        try {
            const now = Date.now()
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    try {
                        const cached = localStorage.getItem(key)
                        if (cached) {
                            const cacheData = JSON.parse(cached)
                            if (now > cacheData.expiresAt) {
                                localStorage.removeItem(key)
                            }
                        }
                    } catch (e) {
                        // Invalid cache entry, remove it
                        localStorage.removeItem(key)
                    }
                }
            })
        } catch (error) {
            console.warn('Failed to clear expired caches:', error)
        }
    },

    // Clear all form caches
    clearAll: () => {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key)
                }
            })
        } catch (error) {
            console.warn('Failed to clear all form caches:', error)
        }
    }
}

// Clean up expired caches on app load
if (typeof window !== 'undefined') {
    formCache.clearExpired()
}

export default formCache
