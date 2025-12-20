import { useState, useEffect, useRef } from 'react'

function ClientCarousel() {
    const clients = [
        { name: 'Ishaq & Sons', initials: 'IS' },
        { name: 'Madina Cable', initials: 'MC' },
        { name: 'Xinda Control Cable', initials: 'XC' },
        { name: 'Qadafi Cables', initials: 'QC' },
        { name: 'AINEY CABLES', initials: 'AC' },
        { name: 'Masood Engineering', initials: 'ME' },
        { name: 'SE Engineering', initials: 'SE' },
        { name: 'Chawla Ent.', initials: 'CE' },
    ]

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const carouselRef = useRef(null)

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % clients.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [isAutoPlaying, clients.length])

    const handlePrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + clients.length) % clients.length)
    }

    const handleNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % clients.length)
    }

    const handleClientClick = (clientName) => {
        // Redirect to login/dashboard
        window.location.href = '/'
    }

    // Generate unique color based on name
    const getClientColor = (name) => {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        const hue = Math.abs(hash) % 360
        return {
            bg: `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`,
            shadow: `hsla(${hue}, 70%, 50%, 0.4)`
        }
    }

    return (
        <div className="client-carousel-container">
            <div className="carousel-header">
                <h3>Our Trusted Clients</h3>
                <p>Partnering with industry leaders across Pakistan</p>
            </div>

            <div className="carousel-wrapper">
                <button className="carousel-btn prev" onClick={handlePrev} aria-label="Previous">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>

                <div className="carousel-track" ref={carouselRef}>
                    {clients.map((client, index) => {
                        const isActive = index === currentIndex
                        const isPrev = index === (currentIndex - 1 + clients.length) % clients.length
                        const isNext = index === (currentIndex + 1) % clients.length
                        const colors = getClientColor(client.name)

                        return (
                            <div
                                key={client.name}
                                className={`carousel-item ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
                                onClick={() => handleClientClick(client.name)}
                            >
                                <div
                                    className="client-card"
                                    style={{
                                        '--client-bg': colors.bg,
                                        '--client-shadow': colors.shadow
                                    }}
                                >
                                    <div className="client-avatar">
                                        {client.initials}
                                    </div>
                                    <div className="client-name">{client.name}</div>
                                    <div className="client-action">
                                        <span>Visit Portal</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <button className="carousel-btn next" onClick={handleNext} aria-label="Next">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6" />
                    </svg>
                </button>
            </div>

            {/* Dots indicator */}
            <div className="carousel-dots">
                {clients.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => {
                            setIsAutoPlaying(false)
                            setCurrentIndex(index)
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            <style>{`
                .client-carousel-container {
                    width: 100%;
                    padding: 2rem 0;
                    background: rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .carousel-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .carousel-header h3 {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                }

                .carousel-header p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.95rem;
                    margin: 0;
                }

                .carousel-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 0 1rem;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .carousel-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .carousel-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: scale(1.1);
                }

                .carousel-track {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    height: 220px;
                    flex: 1;
                    max-width: 500px;
                    overflow: hidden;
                }

                .carousel-item {
                    position: absolute;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0;
                    transform: scale(0.7) translateX(100px);
                    pointer-events: none;
                }

                .carousel-item.prev {
                    opacity: 0.5;
                    transform: scale(0.8) translateX(-120px);
                }

                .carousel-item.active {
                    opacity: 1;
                    transform: scale(1) translateX(0);
                    pointer-events: auto;
                    z-index: 10;
                }

                .carousel-item.next {
                    opacity: 0.5;
                    transform: scale(0.8) translateX(120px);
                }

                .client-card {
                    background: var(--client-bg);
                    border-radius: 20px;
                    padding: 1.5rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 40px var(--client-shadow);
                    min-width: 200px;
                }

                .client-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 50px var(--client-shadow);
                }

                .client-avatar {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: white;
                    margin: 0 auto 1rem;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                }

                .client-name {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    white-space: nowrap;
                }

                .client-action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }

                .client-card:hover .client-action {
                    background: rgba(255, 255, 255, 0.25);
                }

                .carousel-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .dot:hover {
                    background: rgba(255, 255, 255, 0.5);
                }

                .dot.active {
                    background: white;
                    transform: scale(1.2);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .carousel-header h3 {
                        font-size: 1.25rem;
                    }

                    .carousel-header p {
                        font-size: 0.85rem;
                    }

                    .carousel-btn {
                        width: 40px;
                        height: 40px;
                    }

                    .carousel-btn svg {
                        width: 20px;
                        height: 20px;
                    }

                    .carousel-track {
                        height: 200px;
                    }

                    .client-card {
                        padding: 1.25rem 1.5rem;
                        min-width: 170px;
                    }

                    .client-avatar {
                        width: 60px;
                        height: 60px;
                        font-size: 1.25rem;
                    }

                    .client-name {
                        font-size: 1rem;
                    }

                    .carousel-item.prev {
                        transform: scale(0.75) translateX(-100px);
                    }

                    .carousel-item.next {
                        transform: scale(0.75) translateX(100px);
                    }
                }

                @media (max-width: 480px) {
                    .carousel-wrapper {
                        gap: 0.5rem;
                    }

                    .carousel-btn {
                        width: 36px;
                        height: 36px;
                    }

                    .client-card {
                        padding: 1rem 1.25rem;
                        min-width: 150px;
                    }

                    .client-avatar {
                        width: 50px;
                        height: 50px;
                        font-size: 1rem;
                        margin-bottom: 0.75rem;
                    }

                    .client-name {
                        font-size: 0.9rem;
                    }

                    .client-action {
                        font-size: 0.75rem;
                        padding: 0.4rem 0.8rem;
                    }

                    .carousel-item.prev,
                    .carousel-item.next {
                        opacity: 0.3;
                    }
                }
            `}</style>
        </div>
    )
}

export default ClientCarousel
