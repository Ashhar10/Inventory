function ClientCarousel() {
    const clients = [
        { name: 'Ishaq & Sons', initials: 'IS', image: '/assets/clients/ishaq-sons.png' },
        { name: 'Madina Cable', initials: 'MC', image: '/assets/clients/madina-cable.png' },
        { name: 'Xinda Control Cable', initials: 'XC', image: '/assets/clients/xinda-cable.png' },
        { name: 'Qadafi Cables', initials: 'QC', image: '/assets/clients/qadafi-cables.png' },
        { name: 'AINEY CABLES', initials: 'AC', image: '/assets/clients/ainey-cables.png' },
        { name: 'Masood Engineering', initials: 'ME', image: '/assets/clients/masood-engineering.png' },
        { name: 'SE Engineering', initials: 'SE', image: '/assets/clients/se-engineering.png' },
        { name: 'Chawla Ent.', initials: 'CE', image: '/assets/clients/chawla-ent.png' },
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
            bg: `linear-gradient(135deg, hsl(${hue}, 35%, 35%) 0%, hsl(${(hue + 30) % 360}, 40%, 28%) 100%)`,
            shadow: `hsla(${hue}, 35%, 30%, 0.25)`
        }
    }

    // Duplicate clients for seamless infinite scroll
    const duplicatedClients = [...clients, ...clients]

    return (
        <div className="client-marquee-container">
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
                                    <img
                                        src={client.image}
                                        alt={client.name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <span className="initials-fallback">{client.initials}</span>
                                </div>
                                <div className="client-name">{client.name}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <style>{`
                .client-marquee-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    padding: 0.75rem 0;
                    background: rgba(15, 15, 20, 0.95);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    z-index: 1000;
                }

                .marquee-wrapper {
                    width: 100%;
                    overflow: hidden;
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

                .marquee-track {
                    display: flex;
                    gap: 1rem;
                    animation: marquee 20s linear infinite;
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
                    border-radius: 10px;
                    padding: 0.6rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 12px var(--client-shadow);
                    flex-shrink: 0;
                }

                .client-box:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 4px 20px var(--client-shadow);
                }

                .client-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(255, 255, 255, 0.25);
                    flex-shrink: 0;
                    overflow: hidden;
                    position: relative;
                }

                .client-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .initials-fallback {
                    display: none;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: white;
                }

                .client-name {
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .client-marquee-container {
                        padding: 0.6rem 0;
                    }

                    .marquee-track {
                        gap: 0.75rem;
                        animation-duration: 18s;
                    }

                    .client-box {
                        padding: 0.5rem 0.8rem;
                        border-radius: 8px;
                    }

                    .client-avatar {
                        width: 28px;
                        height: 28px;
                        font-size: 0.65rem;
                    }

                    .client-name {
                        font-size: 0.75rem;
                    }
                }

                @media (max-width: 480px) {
                    .client-marquee-container {
                        padding: 0.5rem 0;
                    }

                    .marquee-track {
                        gap: 0.5rem;
                        animation-duration: 15s;
                    }

                    .client-box {
                        padding: 0.4rem 0.6rem;
                    }

                    .client-avatar {
                        width: 24px;
                        height: 24px;
                        font-size: 0.6rem;
                        border-width: 1px;
                    }

                    .client-name {
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </div>
    )
}

export default ClientCarousel
