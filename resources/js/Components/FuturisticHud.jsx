import React from 'react';

/**
 * FuturisticHud Component
 * High-tech holographic HUD visualization matching the SIMITRA BPS dashboard preview.
 * Features:
 * - Glowing Hexagon Data Core in 3D-esque layers with central data graph
 * - Orbiting HUD rings with tick marks, dashed segments & glowing scan line
 * - Mini HUD widgets (floating area chart, bar chart, metrics)
 * - Orbiting user & activity nodes (orange & cyan glowing badges)
 * - Glowing connection paths with moving pulse particles
 * - Floating HUD text labels (INTEGRASI, AKTIVITAS_MITRA, DATA_SE_2026, OPTIMALISASI)
 */
export default function FuturisticHud() {
    return (
        <div className="futuristic-hud-container">
            <style>{`
                .futuristic-hud-container {
                    position: relative;
                    width: 100%;
                    max-width: 680px;
                    height: 380px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                }

                .hud-svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                /* Glow Filters & Colors */
                .hud-cyan { color: #06b6d4; stroke: #06b6d4; }
                .hud-orange { color: #f97316; stroke: #f97316; }

                /* CSS Animations */
                @keyframes spinClockwise {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spinCounter {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.04); }
                }
                @keyframes dashTravel {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes floatParticle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes scanSweep {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .anim-spin-cw {
                    transform-origin: 400px 300px;
                    animation: spinClockwise 25s linear infinite;
                }
                .anim-spin-ccw {
                    transform-origin: 400px 300px;
                    animation: spinCounter 18s linear infinite;
                }
                .anim-spin-fast {
                    transform-origin: 400px 300px;
                    animation: spinClockwise 10s linear infinite;
                }
                .anim-core-pulse {
                    transform-origin: 400px 300px;
                    animation: pulseGlow 4s ease-in-out infinite;
                }
                .anim-scan {
                    transform-origin: 400px 300px;
                    animation: scanSweep 8s linear infinite;
                }
                .anim-float-1 { animation: floatParticle 4s ease-in-out infinite; }
                .anim-float-2 { animation: floatParticle 5s ease-in-out infinite 1s; }
                .anim-float-3 { animation: floatParticle 6s ease-in-out infinite 2s; }

                .pulse-path {
                    stroke-dasharray: 10 150;
                    animation: dashTravel 3s linear infinite;
                }
            `}</style>

            <svg
                viewBox="0 0 800 600"
                className="hud-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Glowing Filters */}
                    <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glow-intense" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="12" result="blur1" />
                        <feGaussianBlur stdDeviation="4" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Gradients */}
                    <radialGradient id="coreGradiant" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="cyanOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>

                    <linearGradient id="areaChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* BACKGROUND AMBIENT GLOW */}
                <circle cx="400" cy="300" r="220" fill="url(#coreGradiant)" />

                {/* ══ OUTER HUD RINGS & TICKS ══ */}
                {/* Outer Dashed Guide Ring */}
                <circle
                    cx="400" cy="300" r="260"
                    fill="none" stroke="rgba(6, 184, 212, 0.15)" strokeWidth="1"
                    strokeDasharray="4 8"
                />

                {/* Rotating Outer Segmented Ring */}
                <g className="anim-spin-cw">
                    <circle
                        cx="400" cy="300" r="240"
                        fill="none" stroke="#06b6d4" strokeWidth="1.5"
                        strokeDasharray="120 40 80 40 40 40"
                        strokeOpacity="0.4"
                        filter="url(#glow-cyan)"
                    />
                    <circle
                        cx="400" cy="300" r="242"
                        fill="none" stroke="#f97316" strokeWidth="1"
                        strokeDasharray="20 180 40 120"
                        strokeOpacity="0.6"
                        filter="url(#glow-orange)"
                    />
                </g>

                {/* Counter Rotating Ring with Ticks */}
                <g className="anim-spin-ccw">
                    <circle
                        cx="400" cy="300" r="210"
                        fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx="400" cy="300" r="190"
                        fill="none" stroke="#06b6d4" strokeWidth="2"
                        strokeDasharray="60 120 90 60"
                        strokeOpacity="0.5"
                        filter="url(#glow-cyan)"
                    />
                </g>

                {/* Radar Scan Line */}
                <g className="anim-scan">
                    <line
                        x1="400" y1="300" x2="630" y2="300"
                        stroke="url(#cyanOrangeGrad)" strokeWidth="1.5" strokeOpacity="0.4"
                    />
                </g>

                {/* ══ NETWORK CONNECTION LINES (Radial & Inter-node) ══ */}
                <g opacity="0.35">
                    <line x1="400" y1="300" x2="160" y2="180" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="400" y1="300" x2="640" y2="160" stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="400" y1="300" x2="660" y2="420" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="400" y1="300" x2="180" y2="440" stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="400" y1="300" x2="400" y2="80" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="400" y1="300" x2="400" y2="520" stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="160" y1="180" x2="260" y2="100" stroke="#06b6d4" strokeWidth="1" />
                    <line x1="640" y1="160" x2="560" y2="90" stroke="#f97316" strokeWidth="1" />
                    <line x1="660" y1="420" x2="580" y2="490" stroke="#06b6d4" strokeWidth="1" />
                    <line x1="180" y1="440" x2="280" y2="500" stroke="#f97316" strokeWidth="1" />
                </g>

                {/* ══ TRAVELLING DATA PULSES ══ */}
                <path d="M400,300 L160,180" stroke="#06b6d4" strokeWidth="3" fill="none" className="pulse-path" filter="url(#glow-cyan)" />
                <path d="M400,300 L640,160" stroke="#f97316" strokeWidth="3" fill="none" className="pulse-path" filter="url(#glow-orange)" />
                <path d="M400,300 L660,420" stroke="#06b6d4" strokeWidth="3" fill="none" className="pulse-path" filter="url(#glow-cyan)" />
                <path d="M400,300 L180,440" stroke="#f97316" strokeWidth="3" fill="none" className="pulse-path" filter="url(#glow-orange)" />

                {/* ══ CENTRAL HEXAGON DATA CORE ══ */}
                <g className="anim-core-pulse">
                    {/* Outer Hexagon Glow Base */}
                    <polygon
                        points="400,210 478,255 478,345 400,390 322,345 322,255"
                        fill="rgba(15, 23, 42, 0.75)"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        filter="url(#glow-intense)"
                    />

                    {/* Secondary Hexagon Frame (Orange Accent) */}
                    <polygon
                        points="400,222 468,261 468,339 400,378 332,339 332,261"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1.5"
                        strokeDasharray="30 10"
                        filter="url(#glow-orange)"
                    />

                    {/* Inner Hexagon Core */}
                    <polygon
                        points="400,238 454,269 454,331 400,362 346,331 346,269"
                        fill="rgba(6, 182, 212, 0.12)"
                        stroke="#06b6d4"
                        strokeWidth="2"
                    />

                    {/* Central 3D Cube / Data Icon */}
                    <g transform="translate(400, 300)" stroke="#06b6d4" strokeWidth="2" fill="none" filter="url(#glow-cyan)">
                        {/* Isometric Data Block */}
                        <path d="M0,-24 L21,-12 L21,12 L0,24 L-21,12 L-21,-12 Z" fill="rgba(6, 184, 212, 0.2)" />
                        <line x1="0" y1="-24" x2="0" y2="24" stroke="#f97316" />
                        <line x1="0" y1="0" x2="21" y2="-12" />
                        <line x1="0" y1="0" x2="-21" y2="-12" />
                        {/* Mini glowing center point */}
                        <circle cx="0" cy="0" r="4" fill="#ffffff" filter="url(#glow-intense)" />
                    </g>
                </g>

                {/* ══ EMBEDDED MINI HUD WIDGETS ══ */}
                {/* Top-Right Area Chart Card */}
                <g transform="translate(530, 110)" className="anim-float-1">
                    <rect x="0" y="0" width="130" height="65" rx="8" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
                    <text x="10" y="16" fill="#06b6d4" fontSize="9" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">INTEGRASI</text>
                    <text x="10" y="27" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="sans-serif" letterSpacing="0.5">AKTIVITAS_MITRA</text>
                    {/* Area Graph Path */}
                    <path d="M10,55 Q35,35 60,45 T110,32 L110,58 L10,58 Z" fill="url(#areaChartGrad)" />
                    <path d="M10,55 Q35,35 60,45 T110,32" fill="none" stroke="#06b6d4" strokeWidth="1.5" filter="url(#glow-cyan)" />
                    <circle cx="110" cy="32" r="3" fill="#f97316" filter="url(#glow-orange)" />
                </g>

                {/* Bottom-Right Bar Chart Card */}
                <g transform="translate(540, 420)" className="anim-float-2">
                    <rect x="0" y="0" width="120" height="60" rx="8" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="1" />
                    <text x="10" y="16" fill="#f97316" fontSize="8" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">OPTIMALISASI</text>
                    {/* Mini Bars */}
                    <rect x="15" y="30" width="8" height="20" rx="2" fill="#06b6d4" />
                    <rect x="28" y="24" width="8" height="26" rx="2" fill="#f97316" />
                    <rect x="41" y="35" width="8" height="15" rx="2" fill="#06b6d4" />
                    <rect x="54" y="20" width="8" height="30" rx="2" fill="#f97316" />
                    <rect x="67" y="28" width="8" height="22" rx="2" fill="#06b6d4" opacity="0.6" />
                    <rect x="80" y="18" width="8" height="32" rx="2" fill="#f97316" />
                </g>

                {/* ══ ORBITING USER & ACTIVITY BADGE NODES ══ */}
                {/* Node 1 - Top Left User Badge */}
                <g transform="translate(250, 140)" className="anim-float-3">
                    <circle cx="0" cy="0" r="16" fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="1.5" filter="url(#glow-orange)" />
                    {/* User Icon */}
                    <circle cx="0" cy="-4" r="4" fill="#ffffff" />
                    <path d="M-7,7 A7,7 0 0,1 7,7 Z" fill="#ffffff" />
                </g>

                {/* Node 2 - Top Right Activity Badge */}
                <g transform="translate(560, 80)" className="anim-float-1">
                    <circle cx="0" cy="0" r="14" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" strokeWidth="1.5" filter="url(#glow-cyan)" />
                    {/* Activity Pulse Icon */}
                    <path d="M-6,0 L-3,-4 L1,5 L4,-2 L7,0" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* Node 3 - Left Middle Shield Badge */}
                <g transform="translate(140, 300)" className="anim-float-2">
                    <circle cx="0" cy="0" r="15" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" strokeWidth="1.5" filter="url(#glow-cyan)" />
                    {/* Shield Icon */}
                    <path d="M-4,-5 L4,-5 L5,0 C5,4 0,7 0,7 C0,7 -5,4 -5,0 Z" fill="none" stroke="#ffffff" strokeWidth="1.3" />
                </g>

                {/* Node 4 - Bottom Right Chart Badge */}
                <g transform="translate(640, 340)" className="anim-float-3">
                    <circle cx="0" cy="0" r="14" fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="1.5" filter="url(#glow-orange)" />
                    {/* Bar chart mini */}
                    <rect x="-6" y="-2" width="3" height="7" fill="#ffffff" />
                    <rect x="-1" y="-5" width="3" height="10" fill="#ffffff" />
                    <rect x="4" y="1" width="3" height="4" fill="#ffffff" />
                </g>

                {/* Node 5 - Bottom Left User Badge */}
                <g transform="translate(260, 480)" className="anim-float-1">
                    <circle cx="0" cy="0" r="15" fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="1.5" filter="url(#glow-orange)" />
                    <circle cx="0" cy="-4" r="4" fill="#ffffff" />
                    <path d="M-7,7 A7,7 0 0,1 7,7 Z" fill="#ffffff" />
                </g>

                {/* ══ SCATTERED GLOWING PARTICLE NODES ══ */}
                <circle cx="160" cy="180" r="5" fill="#06b6d4" filter="url(#glow-cyan)" />
                <circle cx="640" cy="160" r="6" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="660" cy="420" r="5" fill="#06b6d4" filter="url(#glow-cyan)" />
                <circle cx="180" cy="440" r="6" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="340" cy="120" r="4" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="480" cy="100" r="4" fill="#06b6d4" filter="url(#glow-cyan)" />
                <circle cx="210" cy="240" r="3.5" fill="#06b6d4" filter="url(#glow-cyan)" />
                <circle cx="600" cy="240" r="4" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="220" cy="380" r="4" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="580" cy="370" r="3.5" fill="#06b6d4" filter="url(#glow-cyan)" />
                <circle cx="310" cy="520" r="5" fill="#f97316" filter="url(#glow-orange)" />
                <circle cx="490" cy="510" r="4" fill="#06b6d4" filter="url(#glow-cyan)" />

                {/* Tiny accents */}
                <circle cx="380" cy="170" r="2.5" fill="#ffffff" opacity="0.8" />
                <circle cx="440" cy="430" r="2.5" fill="#ffffff" opacity="0.8" />
                <circle cx="280" cy="290" r="2" fill="#06b6d4" />
                <circle cx="520" cy="310" r="2" fill="#f97316" />

                {/* ══ FLOATING HUD TEXT LABELS ══ */}
                <g fontFamily="sans-serif" fontSize="10" fontWeight="700" letterSpacing="1.5">
                    <text x="330" y="470" fill="#f97316" filter="url(#glow-orange)" opacity="0.9">DATA_SE_2026</text>
                    <text x="365" y="160" fill="#06b6d4" filter="url(#glow-cyan)" opacity="0.85">OPTIMALISASI</text>
                </g>
            </svg>
        </div>
    );
}
