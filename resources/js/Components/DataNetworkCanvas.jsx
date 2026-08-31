import { useRef, useEffect, useCallback } from 'react';

/**
 * DataNetworkCanvas — A futuristic animated data-network visualization.
 *
 * Renders on a transparent HTML5 <canvas>:
 *   • Glowing hexagonal "Data Core" at centre
 *   • 18 floating nodes drifting smoothly
 *   • Connection lines with travelling data-packets
 *   • Pulsing energy-flow opacity
 *   • Mouse hover repels / attracts nearby nodes
 *
 * Props:
 *   className  – optional CSS class for the wrapper div
 *   style      – optional inline styles for the wrapper div
 */
export default function DataNetworkCanvas({ className = '', style = {} }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const stateRef = useRef(null); // holds nodes, packets, etc.

    /* ───── helpers ───── */
    const lerp = (a, b, t) => a + (b - a) * t;
    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
    const rand = (lo, hi) => lo + Math.random() * (hi - lo);

    /* ───── colour palette ───── */
    const CYAN = '#00e5ff';
    const ORANGE = '#ff6b00';
    const WHITE_SOFT = 'rgba(255,255,255,0.7)';

    /* ───── initialise state ───── */
    const buildState = useCallback((w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.min(w, h) * 0.46;

        // Nodes
        const NODE_COUNT = 18;
        const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
            const angle = rand(0, Math.PI * 2);
            const radius = rand(maxR * 0.25, maxR);
            return {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                baseX: cx + Math.cos(angle) * radius,
                baseY: cy + Math.sin(angle) * radius,
                r: rand(5, 9),
                vx: rand(-0.15, 0.15),
                vy: rand(-0.15, 0.15),
                phase: rand(0, Math.PI * 2),
                color: i % 3 === 0 ? ORANGE : CYAN,
            };
        });

        // Build edges (each node → core + some inter-node)
        const edges = [];
        nodes.forEach((_, i) => {
            edges.push({ from: -1, to: i }); // -1 = core
        });
        // Add ~12 random inter-node edges
        for (let k = 0; k < 12; k++) {
            const a = Math.floor(rand(0, NODE_COUNT));
            let b = Math.floor(rand(0, NODE_COUNT));
            if (b === a) b = (a + 1) % NODE_COUNT;
            if (!edges.some(e => (e.from === a && e.to === b) || (e.from === b && e.to === a))) {
                edges.push({ from: a, to: b });
            }
        }

        // Data packets travelling along edges
        const PACKET_COUNT = 35;
        const packets = Array.from({ length: PACKET_COUNT }, () => ({
            edgeIdx: Math.floor(rand(0, edges.length)),
            t: rand(0, 1),
            speed: rand(0.002, 0.005),
            size: rand(2.5, 5),
            color: Math.random() > 0.5 ? CYAN : ORANGE,
        }));

        return { cx, cy, maxR, nodes, edges, packets, time: 0 };
    }, []);

    /* ───── draw hexagon path ───── */
    const hexPath = (ctx, cx, cy, r) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    };

    /* ───── main render loop ───── */
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const s = stateRef.current;
        if (!s) return;

        s.time += 0.016; // ~60fps timestep
        const { cx, cy, maxR, nodes, edges, packets, time } = s;
        const mouse = mouseRef.current;

        ctx.clearRect(0, 0, w, h);

        /* ── update nodes ── */
        nodes.forEach((n) => {
            // drift
            n.x += n.vx;
            n.y += n.vy;

            // breathing
            const breathX = Math.sin(time * 0.5 + n.phase) * 10;
            const breathY = Math.cos(time * 0.4 + n.phase) * 10;

            // constrain to radius from base
            const dx = n.x - n.baseX;
            const dy = n.y - n.baseY;
            const d = Math.hypot(dx, dy);
            const limit = maxR * 0.18;
            if (d > limit) {
                n.x = n.baseX + (dx / d) * limit;
                n.y = n.baseY + (dy / d) * limit;
                n.vx *= -0.5;
                n.vy *= -0.5;
            }

            // Mouse interaction
            if (mouse.active) {
                const mdx = n.x - mouse.x;
                const mdy = n.y - mouse.y;
                const md = Math.hypot(mdx, mdy);
                if (md < 160 && md > 0) {
                    const force = (160 - md) / 160 * 0.9;
                    n.vx += (mdx / md) * force;
                    n.vy += (mdy / md) * force;
                }
            }

            // damping
            n.vx *= 0.98;
            n.vy *= 0.98;

            n._drawX = n.x + breathX;
            n._drawY = n.y + breathY;
        });

        /* ── edge helper: get position ── */
        const edgePos = (edge, side) => {
            if (side === 'from') {
                return edge.from === -1 ? { x: cx, y: cy } : { x: nodes[edge.from]._drawX, y: nodes[edge.from]._drawY };
            }
            return { x: nodes[edge.to]._drawX, y: nodes[edge.to]._drawY };
        };

        /* ── draw connection lines ── */
        const globalPulse = 0.4 + 0.15 * Math.sin(time * 1.2);
        edges.forEach((e) => {
            const p1 = edgePos(e, 'from');
            const p2 = edgePos(e, 'to');
            const d = dist(p1.x, p1.y, p2.x, p2.y);
            const alpha = Math.max(0.03, 0.12 - d / (maxR * 6)) * (globalPulse + 0.4);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const col = e.from === -1 ? CYAN : ORANGE;
            ctx.strokeStyle = col.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');
            // convert hex to rgba
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = col;
            ctx.lineWidth = e.from === -1 ? 1.5 : 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        /* ── draw & update data packets ── */
        packets.forEach((p) => {
            p.t += p.speed;
            if (p.t > 1) {
                p.t = 0;
                p.edgeIdx = Math.floor(rand(0, edges.length));
                p.color = Math.random() > 0.5 ? CYAN : ORANGE;
            }
            const e = edges[p.edgeIdx];
            const p1 = edgePos(e, 'from');
            const p2 = edgePos(e, 'to');
            const px = lerp(p1.x, p2.x, p.t);
            const py = lerp(p1.y, p2.y, p.t);

            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        /* ── draw nodes ── */
        nodes.forEach((n) => {
            const pulse = 0.7 + 0.3 * Math.sin(time * 2 + n.phase);

            // Glow
            ctx.beginPath();
            ctx.arc(n._drawX, n._drawY, n.r * 3, 0, Math.PI * 2);
            const grd = ctx.createRadialGradient(n._drawX, n._drawY, 0, n._drawX, n._drawY, n.r * 3);
            grd.addColorStop(0, n.color === CYAN ? 'rgba(0,229,255,0.35)' : 'rgba(255,107,0,0.35)');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(n._drawX, n._drawY, n.r, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.globalAlpha = pulse;
            ctx.shadowColor = n.color;
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Bright center
            ctx.beginPath();
            ctx.arc(n._drawX, n._drawY, n.r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = WHITE_SOFT;
            ctx.fill();
        });

        /* ── draw central data core (hexagon) ── */
        const coreR = Math.min(w, h) * 0.14;
        const corePulse = 0.75 + 0.25 * Math.sin(time * 1.5);

        // Outermost glow
        ctx.save();
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 55;
        hexPath(ctx, cx, cy, coreR + 14);
        ctx.fillStyle = 'rgba(0,229,255,0.04)';
        ctx.fill();
        ctx.restore();

        // Secondary glow (orange)
        ctx.save();
        ctx.shadowColor = ORANGE;
        ctx.shadowBlur = 40;
        hexPath(ctx, cx, cy, coreR + 8);
        ctx.fillStyle = 'rgba(255,107,0,0.06)';
        ctx.fill();
        ctx.restore();

        // Pulsing ring
        ctx.save();
        const ringR = coreR + 18 + 6 * Math.sin(time * 2);
        hexPath(ctx, cx, cy, ringR);
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.15 + 0.1 * Math.sin(time * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Second pulsing ring (orange)
        ctx.save();
        const ringR2 = coreR + 28 + 8 * Math.sin(time * 1.3 + 1);
        hexPath(ctx, cx, cy, ringR2);
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.08 + 0.06 * Math.sin(time * 1.3 + 1);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Main hexagon fill
        hexPath(ctx, cx, cy, coreR);
        const hGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        hGrd.addColorStop(0, `rgba(0,229,255,${0.15 * corePulse})`);
        hGrd.addColorStop(0.6, `rgba(255,107,0,${0.08 * corePulse})`);
        hGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGrd;
        ctx.fill();

        // Hexagon stroke
        hexPath(ctx, cx, cy, coreR);
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 2;
        ctx.globalAlpha = corePulse;
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 28;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Inner hexagon
        hexPath(ctx, cx, cy, coreR * 0.55);
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5 * corePulse;
        ctx.shadowColor = ORANGE;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Centre bright dot
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.shadowBlur = 0;

        // "S" label
        ctx.font = `bold ${Math.round(coreR * 0.5)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CYAN;
        ctx.globalAlpha = 0.8 * corePulse;
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 12;
        ctx.fillText('S', cx, cy + 1);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        /* ── orbiting arcs (decorative) ── */
        for (let i = 0; i < 3; i++) {
            const arcR = coreR + 22 + i * 18;
            const startAngle = time * (0.3 + i * 0.15) + i * 2;
            const sweep = 0.8 + 0.4 * Math.sin(time + i);
            ctx.beginPath();
            ctx.arc(cx, cy, arcR, startAngle, startAngle + sweep);
            ctx.strokeStyle = i % 2 === 0 ? CYAN : ORANGE;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = 0.12 + 0.06 * Math.sin(time + i);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        animRef.current = requestAnimationFrame(render);
    }, []);

    /* ───── resize handler ───── */
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        stateRef.current = buildState(rect.width, rect.height);
    }, [buildState]);

    /* ───── lifecycle ───── */
    useEffect(() => {
        handleResize();

        const onResize = () => handleResize();
        window.addEventListener('resize', onResize);

        animRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', onResize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [handleResize, render]);

    /* ───── mouse handlers ───── */
    const onMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true,
        };
    }, []);

    const onMouseLeave = useCallback(() => {
        mouseRef.current = { x: -9999, y: -9999, active: false };
    }, []);

    return (
        <div
            className={className}
            style={{ position: 'relative', width: '100%', height: '100%', ...style }}
        >
            <canvas
                ref={canvasRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                }}
            />
        </div>
    );
}
