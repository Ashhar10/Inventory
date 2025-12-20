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
            shadow: `hsla(${hue}, 70%, 50%, 0.4)`
        }
    }

    // Duplicate clients for seamless infinite scroll
    const duplicatedClients = [...clients, ...clients]

    return (
        <div className="client-marquee-container">
            <div className="marquee-header">
                <h3>Our Trusted Clients</h3>
            </div>

            <div className="marquee-wrapper">
                <div className="marquee-track">
                    {duplicatedClients.map((client, index) => {
                        const colors = getClientColor(client.name)
                        return (
                            <div
                                key={`${client.name}-${index}`}
                                className="client-box"
                                onClick={handleClientClick}
                                style={{
                                    '--client-bg': colors.bg,
                                    '--client-shadow': colors.shadow
                                }}
                            >
                                <div className="client-avatar">
                                    {client.initials}
                                </div>
                                <div className="client-name">{client.name}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <style>{`
                .client-marquee-container {
                    width: 100%;
                    padding: 1.5rem 0;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .marquee-header {
                    text-align: center;
                    margin-bottom: 1.25rem;
                }

                .marquee-header h3 {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .marquee-wrapper {
                    width: 100%;
                    overflow: hidden;
                    mask-image: linear-gradient(
                        to right,
                        transparent 0%,
                        black 10%,
                        black 90%,
                        transparent 100%
                    );
                    -webkit-mask-image: linear-gradient(
                        to right,
                        transparent 0%,
                        black 10%,
                        black 90%,
                        transparent 100%
                    );
                }

                .marquee-track {
                    display: flex;
                    gap: 1.5rem;
                    animation: marquee 25s linear infinite;
                    width: fit-content;
                }

                .marquee-track:hover {
                    animation-play-state: paused;
                }

                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .client-box {
                    background: var(--client-bg);
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px var(--client-shadow);
                    flex-shrink: 0;
                    min-width: 180px;
                }

                .client-box:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 30px var(--client-shadow);
                }

                .client-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                }

                .client-name {
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .client-marquee-container {
                        padding: 1rem 0;
                    }

                    .marquee-header h3 {
                        font-size: 0.85rem;
                        letter-spacing: 1.5px;
                    }

                    .marquee-track {
                        gap: 1rem;
                        animation-duration: 20s;
                    }

                    .client-box {
                        padding: 0.75rem 1rem;
                        min-width: 150px;
                        border-radius: 10px;
                    }

                    .client-avatar {
                        width: 38px;
                        height: 38px;
                        font-size: 0.85rem;
                    }

                    .client-name {
                        font-size: 0.85rem;
                    }
                }

                @media (max-width: 480px) {
                    .marquee-track {
                        gap: 0.75rem;
                        animation-duration: 18s;
                    }

                    .client-box {
                        padding: 0.6rem 0.8rem;
                        min-width: 130px;
                    }

                    .client-avatar {
                        width: 32px;
                        height: 32px;
                        font-size: 0.75rem;
                    }

                    .client-name {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    )
}

export default ClientCarousel
