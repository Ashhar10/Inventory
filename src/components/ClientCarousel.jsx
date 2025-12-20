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
        return {
            bg: `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`,
            shadow: `hsla(${hue}, 70%, 50%, 0.3)`
        }
    }

    // Duplicate clients for seamless infinite scroll
    const duplicatedClients = [...clients, ...clients]

    return (
        <>
            {/* Desktop: Fixed Bottom Horizontal */}
            <div className="client-marquee-desktop">
                <div className="marquee-track-horizontal">
                    {duplicatedClients.map((client, index) => {
                        const colors = getClientColor(client.name)
                        return (
                            <div
                                key={`desktop-${client.name}-${index}`}
                                className="client-box-horizontal"
                                onClick={handleClientClick}
                                style={{
                                    '--client-bg': colors.bg,
                                    '--client-shadow': colors.shadow
                                }}
                            >
                                <div className="client-avatar">{client.initials}</div>
                                <div className="client-name">{client.name}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Mobile: Fixed Left Vertical */}
            <div className="client-marquee-mobile">
                <div className="marquee-track-vertical">
                    {duplicatedClients.map((client, index) => {
                        const colors = getClientColor(client.name)
                        return (
                            <div
                                key={`mobile-${client.name}-${index}`}
                                className="client-box-vertical"
                                onClick={handleClientClick}
                                style={{
                                    '--client-bg': colors.bg,
                                    '--client-shadow': colors.shadow
                                }}
                            >
                                <div className="client-avatar-small">{client.initials}</div>
                            </div>
                        )
                    })}
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
                    mask-image: linear-gradient(
                        to right,
                        transparent 0%,
                        black 5%,
                        black 95%,
                        transparent 100%
                    );
                    -webkit-mask-image: linear-gradient(
                        to right,
                        transparent 0%,
                        black 5%,
                        black 95%,
                        transparent 100%
                    );
                }

                .marquee-track-horizontal {
                    display: flex;
                    gap: 1.5rem;
                    animation: marquee-horizontal 30s linear infinite;
                    width: fit-content;
                }

                .marquee-track-horizontal:hover {
                    animation-play-state: paused;
                }

                @keyframes marquee-horizontal {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .client-box-horizontal {
                    background: var(--client-bg);
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 15px var(--client-shadow);
                    flex-shrink: 0;
                }

                .client-box-horizontal:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 25px var(--client-shadow);
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

                /* ========== MOBILE: Fixed Left Vertical ========== */
                .client-marquee-mobile {
                    display: none;
                }

                /* Hide desktop on mobile, show mobile version */
                @media (max-width: 768px) {
                    .client-marquee-desktop {
                        display: none;
                    }

                    .client-marquee-mobile {
                        position: fixed;
                        left: 0;
                        top: 60px;
                        bottom: 70px;
                        width: 50px;
                        background: rgba(15, 15, 20, 0.9);
                        backdrop-filter: blur(20px);
                        border-right: 1px solid rgba(255, 255, 255, 0.1);
                        overflow: hidden;
                        z-index: 998;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        mask-image: linear-gradient(
                            to bottom,
                            transparent 0%,
                            black 10%,
                            black 90%,
                            transparent 100%
                        );
                        -webkit-mask-image: linear-gradient(
                            to bottom,
                            transparent 0%,
                            black 10%,
                            black 90%,
                            transparent 100%
                        );
                    }

                    .marquee-track-vertical {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                        animation: marquee-vertical 20s linear infinite;
                        height: fit-content;
                    }

                    .marquee-track-vertical:hover {
                        animation-play-state: paused;
                    }

                    @keyframes marquee-vertical {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(-50%);
                        }
                    }

                    .client-box-vertical {
                        cursor: pointer;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                    }

                    .client-box-vertical:hover {
                        transform: scale(1.1);
                    }

                    .client-avatar-small {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: var(--client-bg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.65rem;
                        font-weight: 800;
                        color: white;
                        box-shadow: 0 2px 10px var(--client-shadow);
                        border: 2px solid rgba(255, 255, 255, 0.2);
                    }
                }

                @media (max-width: 480px) {
                    .client-marquee-mobile {
                        width: 45px;
                        top: 55px;
                        bottom: 75px;
                    }

                    .client-avatar-small {
                        width: 32px;
                        height: 32px;
                        font-size: 0.6rem;
                    }

                    .marquee-track-vertical {
                        gap: 0.6rem;
                    }
                }
            `}</style>
        </>
    )
}

export default ClientCarousel
