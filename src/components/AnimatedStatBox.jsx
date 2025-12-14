import { useState, useEffect } from 'react'

// Animated stat box component with slideshow
function AnimatedStatBox({ slides, autoPlayInterval = 3000 }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, autoPlayInterval)

        return () => clearInterval(timer)
    }, [slides.length, autoPlayInterval])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <div className="glass-card stat-card animated-stat-card">
            <div className="stat-slideshow">
                <button className="slide-arrow slide-arrow-left" onClick={prevSlide}>
                    ‹
                </button>

                <div className="slide-content">
                    <div className="stat-value">{slides[currentSlide].value}</div>
                    <div className="stat-label">{slides[currentSlide].label}</div>
                </div>

                <button className="slide-arrow slide-arrow-right" onClick={nextSlide}>
                    ›
                </button>
            </div>

            <div className="slide-indicators">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>

            <style jsx>{`
                .animated-stat-card {
                    position: relative;
                    overflow: hidden;
                }

                .stat-slideshow {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--spacing-sm);
                    min-height: 80px;
                }

                .slide-content {
                    flex: 1;
                    text-align: center;
                    animation: fadeIn 0.5s ease-in-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .slide-arrow {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .slide-arrow:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .slide-indicators {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin-top: var(--spacing-sm);
                }

                .indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .indicator.active {
                    background: white;
                    width: 24px;
                    border-radius: 4px;
                }

                .indicator:hover {
                    background: rgba(255, 255, 255, 0.6);
                }
            `}</style>
        </div>
    )
}

export default AnimatedStatBox
