"use client";

import { useRef, useEffect, useCallback } from "react";

// --- Configuration ---
const PARTICLE_COUNT_BODY = 4000;
const PARTICLE_COUNT_SHACKLE = 2000;
const RING_COUNT = 5;
const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    alpha: number;
    drift: number;
}

// Check if a point is inside the padlock body (rounded rect)
function isInBody(px: number, py: number, bx: number, by: number, bw: number, bh: number, r: number): boolean {
    const rx = Math.max(bx + r, Math.min(px, bx + bw - r));
    const ry = Math.max(by + r, Math.min(py, by + bh - r));
    if (px >= bx + r && px <= bx + bw - r && py >= by && py <= by + bh) return true;
    if (px >= bx && px <= bx + bw && py >= by + r && py <= by + bh - r) return true;
    const dx = px - rx;
    const dy = py - ry;
    return dx * dx + dy * dy <= r * r;
}

// Check if a point is on the shackle arc
function isOnShackle(px: number, py: number, cx: number, cy: number, outerR: number, innerR: number, topY: number): boolean {
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (py > cy) return false; // only top half
    if (py < topY && dist > innerR && dist < outerR) return true;
    if (py >= topY && py <= cy) {
        // vertical bars
        if (px > cx - outerR && px < cx - innerR) return true;
        if (px > cx + innerR && px < cx + outerR) return true;
    }
    return dist >= innerR && dist <= outerR && py <= cy;
}

// Check if point is in the keyhole
function isInKeyhole(px: number, py: number, kx: number, ky: number): boolean {
    // Circle part
    const cr = 14;
    const dx = px - kx;
    const dy = py - (ky - 8);
    if (dx * dx + dy * dy < cr * cr) return true;
    // Trapezoid part
    const tw = 12;
    const bw = 22;
    const th = 35;
    const ty = ky;
    if (py >= ty && py <= ty + th) {
        const t = (py - ty) / th;
        const halfW = tw + (bw - tw) * t;
        if (Math.abs(px - kx) < halfW / 2) return true;
    }
    return false;
}

function generateParticles(
    canvasW: number,
    canvasH: number
): { bodyParticles: Particle[]; shackleParticles: Particle[] } {
    // Padlock dimensions relative to canvas
    const lockW = canvasW * 0.38;
    const lockH = lockW * 0.72;
    const lockX = canvasW * 0.58;
    const lockY = canvasH * 0.42;
    const lockR = lockW * 0.06;
    const keyholeX = lockX + lockW / 2;
    const keyholeY = lockY + lockH * 0.48;

    // Shackle dimensions
    const shackleCX = lockX + lockW / 2;
    const shackleCY = lockY;
    const shackleOuterR = lockW * 0.38;
    const shackleInnerR = lockW * 0.24;
    const shackleTopY = lockY - lockW * 0.45;

    const bodyParticles: Particle[] = [];
    const shackleParticles: Particle[] = [];

    // Generate body particles
    let attempts = 0;
    while (bodyParticles.length < PARTICLE_COUNT_BODY && attempts < PARTICLE_COUNT_BODY * 10) {
        attempts++;
        const px = lockX + Math.random() * lockW;
        const py = lockY + Math.random() * lockH;
        if (isInBody(px, py, lockX, lockY, lockW, lockH, lockR) && !isInKeyhole(px, py, keyholeX, keyholeY)) {
            bodyParticles.push({
                x: px, y: py, baseX: px, baseY: py,
                size: 0.5 + Math.random() * 1.5,
                alpha: 0.3 + Math.random() * 0.7,
                drift: Math.random() * Math.PI * 2,
            });
        }
    }

    // Generate shackle particles
    attempts = 0;
    while (shackleParticles.length < PARTICLE_COUNT_SHACKLE && attempts < PARTICLE_COUNT_SHACKLE * 10) {
        attempts++;
        const px = shackleCX - shackleOuterR - 5 + Math.random() * (shackleOuterR * 2 + 10);
        const py = shackleTopY - 5 + Math.random() * (shackleCY - shackleTopY + 10);
        if (isOnShackle(px, py, shackleCX, shackleCY, shackleOuterR, shackleInnerR, shackleTopY)) {
            shackleParticles.push({
                x: px, y: py, baseX: px, baseY: py,
                size: 0.5 + Math.random() * 1.5,
                alpha: 0.2 + Math.random() * 0.6,
                drift: Math.random() * Math.PI * 2,
            });
        }
    }

    return { bodyParticles, shackleParticles };
}

export default function HeroLockCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const particlesRef = useRef<{ bodyParticles: Particle[]; shackleParticles: Particle[] } | null>(null);
    const dimensionsRef = useRef({ w: 0, h: 0 });

    const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
        const { w, h } = dimensionsRef.current;
        const particles = particlesRef.current;
        if (!particles) return;

        ctx.clearRect(0, 0, w, h);

        const lockW = w * 0.38;
        const lockH = lockW * 0.72;
        const lockX = w * 0.58;
        const lockY = h * 0.42;
        const keyholeX = lockX + lockW / 2;
        const keyholeY = lockY + lockH * 0.48;

        // ---- Draw grid lines across the body ----
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.5;
        const gridSpacing = lockW / 20;
        for (let i = 0; i <= 20; i++) {
            const gx = lockX + i * gridSpacing;
            ctx.beginPath(); ctx.moveTo(gx, lockY); ctx.lineTo(gx, lockY + lockH); ctx.stroke();
        }
        for (let i = 0; i <= 15; i++) {
            const gy = lockY + i * (lockH / 15);
            ctx.beginPath(); ctx.moveTo(lockX, gy); ctx.lineTo(lockX + lockW, gy); ctx.stroke();
        }

        // ---- Draw data rings (left side) ----
        const ringsCenterY = h * 0.42;
        for (let i = 0; i < RING_COUNT; i++) {
            const ringX = w * 0.06 + i * w * 0.085;
            const ringR = 16 + i * 6;
            const scaleX = 0.35; // perspective squash
            const rotSpeed = (i % 2 === 0 ? 1 : -1) * (0.3 + i * 0.1);
            const rot = time * rotSpeed * 0.001;

            ctx.save();
            ctx.translate(ringX, ringsCenterY);
            ctx.scale(scaleX, 1);
            ctx.rotate(rot);

            // Outer ring
            ctx.strokeStyle = `rgba(255,255,255,${0.3 + i * 0.08})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke();

            // Inner ring
            ctx.strokeStyle = `rgba(255,255,255,${0.15 + i * 0.05})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.beginPath(); ctx.arc(0, 0, ringR * 0.65, 0, Math.PI * 2); ctx.stroke();

            // Core dot
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(255,255,255,${0.4 + i * 0.1})`;
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();

            // Decorative dots on ring
            for (let d = 0; d < 8; d++) {
                const da = (d / 8) * Math.PI * 2;
                const ddx = Math.cos(da) * ringR;
                const ddy = Math.sin(da) * ringR;
                ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(time * 0.002 + d) * 0.15})`;
                ctx.beginPath(); ctx.arc(ddx, ddy, 1, 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
        }

        // ---- Draw convergence cone lines ----
        const coneStartX = w * 0.06 + (RING_COUNT - 1) * w * 0.085 + 20;
        const coneEndX = keyholeX;
        const coneEndY = keyholeY;
        ctx.setLineDash([4, 6]);
        for (let i = 0; i < 8; i++) {
            const startY = ringsCenterY - 50 + i * (100 / 7);
            const alpha = 0.06 + Math.sin(time * 0.001 + i) * 0.04;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(coneStartX, startY);
            ctx.lineTo(coneEndX, coneEndY);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // ---- Draw particles (body + shackle) ----
        const allP = [...particles.bodyParticles, ...particles.shackleParticles];
        for (const p of allP) {
            const wobble = Math.sin(time * 0.001 + p.drift) * 1.2;
            const px = p.baseX + wobble;
            const py = p.baseY + Math.cos(time * 0.0008 + p.drift) * 0.8;
            const shimmer = p.alpha * (0.7 + 0.3 * Math.sin(time * 0.002 + p.drift));
            ctx.fillStyle = `rgba(255,255,255,${shimmer})`;
            ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
        }

        // ---- Draw horizontal data scan lines across the body ----
        for (let i = 0; i < 8; i++) {
            const scanY = lockY + 10 + i * (lockH / 8);
            const scanAlpha = 0.03 + Math.sin(time * 0.003 + i * 0.5) * 0.025;
            ctx.strokeStyle = `rgba(255,255,255,${scanAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([Math.random() * 10 + 5, Math.random() * 8 + 2]);
            ctx.beginPath(); ctx.moveTo(lockX + 5, scanY); ctx.lineTo(lockX + lockW - 5, scanY); ctx.stroke();
        }
        ctx.setLineDash([]);

        // ---- Keyhole glow ----
        const keyholeGlowR = 40 + Math.sin(time * 0.002) * 8;
        const grad = ctx.createRadialGradient(keyholeX, keyholeY, 0, keyholeX, keyholeY, keyholeGlowR);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(0.3, "rgba(255,240,220,0.5)");
        grad.addColorStop(0.6, "rgba(255,220,180,0.15)");
        grad.addColorStop(1, "rgba(255,200,150,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY, keyholeGlowR, 0, Math.PI * 2); ctx.fill();

        // Keyhole shape
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY - 8, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(keyholeX - 7, keyholeY);
        ctx.lineTo(keyholeX - 12, keyholeY + 28);
        ctx.lineTo(keyholeX + 12, keyholeY + 28);
        ctx.lineTo(keyholeX + 7, keyholeY);
        ctx.closePath();
        ctx.fill();

        // ---- Labels ----
        ctx.font = "9px monospace";
        ctx.textAlign = "left";
        ctx.letterSpacing = "2px";

        const labels = [
            { text: "ENTROPY & BRUTE DETECT", x: w * 0.30, y: h * 0.12, tx: lockX + lockW * 0.3, ty: lockY - lockW * 0.25 },
            { text: "LIVE VAULT ENCRYPTION", x: w * 0.10, y: h * 0.26, tx: lockX + lockW * 0.1, ty: lockY + lockH * 0.15 },
            { text: "ZERO-KNOWLEDGE AUTH", x: w * 0.25, y: h * 0.52, tx: lockX + lockW * 0.2, ty: lockY + lockH * 0.5 },
            { text: "MASTER KEY INTELLIGENCE", x: w * 0.15, y: h * 0.72, tx: lockX + lockW * 0.15, ty: lockY + lockH * 0.7 },
            { text: "VAULT SECURITY", x: w * 0.08, y: h * 0.88, tx: lockX + lockW * 0.08, ty: lockY + lockH * 0.85 },
        ];

        for (const label of labels) {
            // Connection line
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 3]);
            ctx.beginPath(); ctx.moveTo(label.x + 80, label.y); ctx.lineTo(label.tx, label.ty); ctx.stroke();
            ctx.setLineDash([]);

            // Dot at end
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.beginPath(); ctx.arc(label.x + 80, label.y, 2, 0, Math.PI * 2); ctx.fill();

            // Label box
            const textW = ctx.measureText(label.text).width;
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 1;
            ctx.fillRect(label.x - 8, label.y - 11, textW + 16, 18);
            ctx.strokeRect(label.x - 8, label.y - 11, textW + 16, 18);

            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText(label.text, label.x, label.y + 3);
        }

        // ---- Small network graph (bottom right) ----
        const ngX = w * 0.88;
        const ngY = h * 0.82;
        const nodes = [
            { x: 0, y: 0 }, { x: 20, y: -15 }, { x: -15, y: -20 },
            { x: 25, y: 10 }, { x: -10, y: 18 }, { x: 15, y: 25 },
            { x: -25, y: 5 }, { x: 8, y: -30 },
        ];
        const edges: [number, number][] = [
            [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 7],
            [3, 5], [4, 6], [2, 6], [5, 3], [7, 2],
        ];
        // Edges
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.5;
        for (const edge of edges) {
            const nodeA = nodes[edge[0]];
            const nodeB = nodes[edge[1]];
            if (!nodeA || !nodeB) continue;
            ctx.beginPath(); ctx.moveTo(ngX + nodeA.x, ngY + nodeA.y); ctx.lineTo(ngX + nodeB.x, ngY + nodeB.y); ctx.stroke();
        }
        // Nodes
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!node) continue;
            const pulse = 2 + Math.sin(time * 0.003 + i) * 1;
            ctx.fillStyle = i % 3 === 0 ? "rgba(255,120,50,0.9)" : "rgba(255,255,255,0.6)";
            ctx.beginPath(); ctx.arc(ngX + node.x, ngY + node.y, pulse, 0, Math.PI * 2); ctx.fill();
        }

        // Small label
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "7px monospace";
        ctx.fillText("//TOP BUNDLES - 26N", ngX - 30, ngY - 38);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (!rect) return;
            const w = rect.width;
            const h = rect.height;
            canvas.width = w * DPR;
            canvas.height = h * DPR;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            dimensionsRef.current = { w, h };
            particlesRef.current = generateParticles(w, h);
        };

        resize();
        window.addEventListener("resize", resize);

        const animate = (time: number) => {
            draw(ctx, time);
            animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
        />
    );
}
