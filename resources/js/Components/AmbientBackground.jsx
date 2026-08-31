import React from 'react';

/**
 * AmbientBackground Component
 * A minimal, modern ambient backdrop with smooth, floating glowing orbs.
 * Features 4 large soft overlapping color gradients (Neon Orange #FF6B00, Cyan #00FFFF, Deep Blue)
 * with a heavy blur filter and infinite floating CSS animations.
 */
export default function AmbientBackground({ className = '', style = {} }) {
    return (
        <div className={`ambient-container ${className}`} style={style}>
            <style>{`
                .ambient-container {
                    position: relative;
                    width: 100%;
                    height: 320px;
                    margin: 1.5rem 0 1rem;
                    overflow: hidden;
                    border-radius: 20px;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ambient-orbs-wrapper {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .ambient-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(90px);
                    opacity: 0.6;
                    will-change: transform, opacity;
                }

                /* Orb 1: Neon Orange */
                .ambient-orb-1 {
                    width: 240px;
                    height: 240px;
                    background: #FF6B00;
                    top: 10%;
                    left: 15%;
                    animation: floatOrb1 14s ease-in-out infinite alternate;
                }

                /* Orb 2: Cyan */
                .ambient-orb-2 {
                    width: 260px;
                    height: 260px;
                    background: #00FFFF;
                    bottom: 10%;
                    right: 15%;
                    animation: floatOrb2 16s ease-in-out infinite alternate;
                }

                /* Orb 3: Deep Blue */
                .ambient-orb-3 {
                    width: 220px;
                    height: 220px;
                    background: #1e40af;
                    top: 35%;
                    left: 45%;
                    animation: floatOrb3 12s ease-in-out infinite alternate;
                }

                /* Orb 4: Soft Mixed Accent (Cyan & Orange Blend) */
                .ambient-orb-4 {
                    width: 180px;
                    height: 180px;
                    background: linear-gradient(135deg, #00FFFF 0%, #FF6B00 100%);
                    bottom: 25%;
                    left: 20%;
                    animation: floatOrb4 18s ease-in-out infinite alternate;
                }

                /* Keyframes for slow, organic drifting & scaling */
                @keyframes floatOrb1 {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.55;
                    }
                    50% {
                        transform: translate(60px, 35px) scale(1.15);
                        opacity: 0.75;
                    }
                    100% {
                        transform: translate(-30px, 50px) scale(0.95);
                        opacity: 0.5;
                    }
                }

                @keyframes floatOrb2 {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translate(-50px, -40px) scale(1.2);
                        opacity: 0.7;
                    }
                    100% {
                        transform: translate(40px, -20px) scale(0.9);
                        opacity: 0.45;
                    }
                }

                @keyframes floatOrb3 {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translate(-40px, 30px) scale(1.1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translate(50px, -35px) scale(0.85);
                        opacity: 0.5;
                    }
                }

                @keyframes floatOrb4 {
                    0% {
                        transform: translate(0, 0) scale(0.9);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translate(45px, -45px) scale(1.25);
                        opacity: 0.65;
                    }
                    100% {
                        transform: translate(-25px, -20px) scale(1);
                        opacity: 0.4;
                    }
                }

                /* Center Logo Card with glassmorphism glow */
                .ambient-center-card {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.75rem 2.5rem;
                    border-radius: 24px;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }

                .ambient-center-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(255, 107, 0, 0.3);
                }

                .ambient-logo-img {
                    width: 72px;
                    height: 72px;
                    object-fit: contain;
                    border-radius: 18px;
                    filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.4));
                    animation: logoPulse 4s ease-in-out infinite;
                }

                @keyframes logoPulse {
                    0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.4));
                    }
                    50% {
                        transform: scale(1.04);
                        filter: drop-shadow(0 0 35px rgba(0, 255, 255, 0.5));
                    }
                }

                .ambient-card-title {
                    margin-top: 0.85rem;
                    font-size: 0.95rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    color: #ffffff;
                    text-transform: uppercase;
                }

                .ambient-card-sub {
                    font-size: 0.65rem;
                    font-weight: 500;
                    letter-spacing: 0.15em;
                    color: #00FFFF;
                    opacity: 0.85;
                    text-transform: uppercase;
                    margin-top: 0.2rem;
                }
            `}</style>

            {/* Glowing Orbs Container */}
            <div className="ambient-orbs-wrapper">
                <div className="ambient-orb ambient-orb-1" />
                <div className="ambient-orb ambient-orb-2" />
                <div className="ambient-orb ambient-orb-3" />
                <div className="ambient-orb ambient-orb-4" />
            </div>

            {/* Center Glass Card with Logo */}
            <div className="ambient-center-card">
                <img src="/logo.png" alt="SIMITRA Logo" className="ambient-logo-img" />
                <div className="ambient-card-title">SIMITRA</div>
                <div className="ambient-card-sub">Integrated Data Network</div>
            </div>
        </div>
    );
}
