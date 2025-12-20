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

    const handleClientClick = () => {
        window.location.href = '/'
    }

    // Generate unique color based on name
    const getClientColor = (name) => {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        const hue = Math.abs(hash) % 360
        return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`
    }

    return (
        <>
            {/* Desktop: Fixed Bottom Horizontal - Seamless Loop */}
            <div className="client-marquee-desktop">
                <div className="marquee-track-horizontal">
                    {/* First set */}
                    {clients.map((client, index) => (
                        <div
                            key={`set1-${index}`}
                            className="client-box-horizontal"
                            onClick={handleClientClick}
                            style={{ background: getClientColor(client.name) }}
                        >
                            <div className="client-avatar">{client.initials}</div>
                            <div className="client-name">{client.name}</div>
                        </div>
                    ))}
                    {/* Second set (duplicate for seamless loop) */}
                    {clients.map((client, index) => (
                        <div
                            key={`set2-${index}`}
                            className="client-box-horizontal"
                            onClick={handleClientClick}
                            style={{ background: getClientColor(client.name) }}
                        >
                            <div className="client-avatar">{client.initials}</div>
                            <div className="client-name">{client.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: Fixed Right Vertical - Seamless Loop */}
            <div className="client-marquee-mobile">
                <div className="marquee-track-vertical">
                    {/* First set */}
                    {clients.map((client, index) => (
                        <div
                            key={`mset1-${index}`}
                            className="client-box-vertical"
                            onClick={handleClientClick}
                            style={{ background: getClientColor(client.name) }}
                        >
                            {client.initials}
                        </div>
                    ))}
                    {/* Second set (duplicate for seamless loop) */}
                    {clients.map((client, index) => (
                        <div
                            key={`mset2-${index}`}
                            className="client-box-vertical"
                            onClick={handleClientClick}
                            style={{ background: getClientColor(client.name) }}
                        >
                            {client.initials}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                /* ========== DESKTOP: Fixed Bottom Horizontal ========== */
                .client-marquee-desktop {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: rgba(15, 15, 20, 0.95);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    z-index: 999;
                    display: flex;
                    align-items: center;
                }

                .marquee-track-horizontal {
                    display: flex;
                    gap: 1.5rem;
                    width: max-content;
                    animation: scroll-left 25s linear infinite;
                }

                @keyframes scroll-left {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-50% - 0.75rem));
                    }
                }

                .client-box-horizontal {
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    flex-shrink: 0;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
                }

                .client-box-horizontal:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                }

                .client-box-horizontal .client-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                }

                .client-box-horizontal .client-name {
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* ========== MOBILE: Fixed Right Vertical ========== */
                .client-marquee-mobile {
                    display: none;
                }

                @media (max-width: 768px) {
                    .client-marquee-desktop {
                        display: none;
                    }

                    .client-marquee-mobile {
                        position: fixed;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        width: 42px;
                        background: rgba(15, 15, 20, 0.95);
                        backdrop-filter: blur(20px);
                        border-left: 1px solid rgba(255, 255, 255, 0.1);
                        overflow: hidden;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .marquee-track-vertical {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        height: max-content;
                        animation: scroll-up 12s linear infinite;
                    }

                    @keyframes scroll-up {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(calc(-50% - 4px));
                        }
                    }

                    .client-box-vertical {
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.55rem;
                        font-weight: 800;
                        color: white;
                        cursor: pointer;
                        transition: transform 0.2s ease;
                        flex-shrink: 0;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
                    }

                    .client-box-vertical:hover {
                        transform: scale(1.15);
                    }
                }

                @media (max-width: 480px) {
                    .client-marquee-mobile {
                        width: 38px;
                    }

                    .client-box-vertical {
                        width: 28px;
                        height: 28px;
                        font-size: 0.5rem;
                    }

                    .marquee-track-vertical {
                        gap: 6px;
                    }

                    @keyframes scroll-up {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(calc(-50% - 3px));
                        }
                    }
                }
            `}</style>
        </>
    )
}

export default ClientCarousel
