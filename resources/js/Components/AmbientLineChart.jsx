import React, { useEffect, useRef, useState } from 'react';

/**
 * AmbientLineChart Component
 * A minimalist animated curved line chart for UI background.
 * Features:
 * - Transparent container background
 * - Sleek, undulating curved trend line with Neon Orange (#FF6B00) glow
 * - Soft Cyan (#00FFFF) gradient fill under the line fading out at bottom
 * - Smooth real-time wave/undulation animation using requestAnimationFrame
 * - Glowing data points travelling along the curve
 * - Clean & high-tech (no grid lines or axis numbers)
 */
export default function AmbientLineChart({ className = '', style = {} }) {
    const [pathD, setPathD] = useState('');
    const [areaD, setAreaD] = useState('');
    const [points, setPoints] = useState([]);
    const animRef = useRef(null);

    useEffect(() => {
        let startTime = performance.now();
        const width = 600;
        const height = 260;
        const basePointsCount = 7;

        // X coordinates evenly distributed across canvas width
        const xStep = width / (basePointsCount - 1);
        const xCoords = Array.from({ length: basePointsCount }, (_, i) => i * xStep);

        // Baseline Y positions forming an upward economic trend curve
        const baseYs = [180, 160, 190, 110, 140, 70, 50];

        // Smooth Catmull-Rom or Cubic Bezier path generator
        const animate = (currentTime) => {
            const time = (currentTime - startTime) * 0.0012; // slow smooth time speed

            // Calculate dynamic animated Y coordinates using superimposed sine waves
            const animatedYs = baseYs.map((baseY, i) => {
                const wave1 = Math.sin(time * 1.5 + i * 0.8) * 14;
                const wave2 = Math.cos(time * 0.9 + i * 1.2) * 8;
                return baseY + wave1 + wave2;
            });

            // Store current point positions for glowing dot markers
            const currentPoints = xCoords.map((x, i) => ({ x, y: animatedYs[i] }));
            setPoints(currentPoints);

            // Construct smooth SVG Bezier Curve string
            let pathStr = `M ${xCoords[0]} ${animatedYs[0]}`;
            for (let i = 0; i < basePointsCount - 1; i++) {
                const x0 = xCoords[i];
                const y0 = animatedYs[i];
                const x1 = xCoords[i + 1];
                const y1 = animatedYs[i + 1];
                const cpX = (x0 + x1) / 2;

                pathStr += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
            }

            // Closed area path for gradient fill below line
            const areaStr = `${pathStr} L ${width} ${height} L 0 ${height} Z`;

            setPathD(pathStr);
            setAreaD(areaStr);

            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <div className={`ambient-line-chart-container ${className}`} style={style}>
            <style>{`
                .ambient-line-chart-container {
                    position: relative;
                    width: 100%;
                    height: 280px;
                    margin: 1.5rem 0 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    user-select: none;
                }

                .ambient-chart-svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                /* Pulsing animation for peak data points */
                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 0.85; }
                    50% { transform: scale(1.4); opacity: 1; }
                }

                .dot-pulse {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: pulseDot 3s ease-in-out infinite;
                }
            `}</style>

            <svg
                viewBox="0 0 600 260"
                className="ambient-chart-svg"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Neon Orange Line Glow Filter */}
                    <filter id="neonGlowOrange" x="-20%" y="-30%" width="140%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur1" />
                        <feGaussianBlur stdDeviation="2" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Glowing Point Filter */}
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Gradient Fill Below Line: Cyan (#00FFFF) to Transparent */}
                    <linearGradient id="cyanFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.28" />
                        <stop offset="40%" stopColor="#00FFFF" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Line Stroke Gradient (Neon Orange with subtle Cyan highlight at start) */}
                    <linearGradient id="lineStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6B00" />
                        <stop offset="50%" stopColor="#FF7A00" />
                        <stop offset="100%" stopColor="#FF6B00" />
                    </linearGradient>
                </defs>

                {/* 1. SOFT CYAN GRADIENT FILL BELOW THE CURVE */}
                {areaD && (
                    <path
                        d={areaD}
                        fill="url(#cyanFillGradient)"
                    />
                )}

                {/* 2. GLOWING NEON ORANGE CURVED LINE GRAPH */}
                {pathD && (
                    <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineStrokeGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#neonGlowOrange)"
                    />
                )}

                {/* 3. GLOWING DATA POINT DOTS ALONG THE CURVE */}
                {points.map((pt, idx) => (
                    <g key={idx} className="dot-pulse" style={{ animationDelay: `${idx * 0.4}s` }}>
                        {/* Outer Glow Circle */}
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="6"
                            fill="#FF6B00"
                            opacity="0.5"
                            filter="url(#dotGlow)"
                        />
                        {/* Inner Bright Point */}
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="3"
                            fill="#ffffff"
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
