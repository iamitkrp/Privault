"use client";

import { useRef, useEffect, useCallback } from "react";

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

function buildStaticLock(w: number, h: number): HTMLCanvasElement {
    const off = document.createElement("canvas");
    off.width = w * DPR;
    off.height = h * DPR;
    const ctx = off.getContext("2d")!;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const bodyW = w * 0.38;
    const bodyH = bodyW * 0.78;
    const bodyX = (w - bodyW) / 2;
    const bodyY = h * 0.40;
    const bodyR = 10;
    const keyholeX = bodyX + bodyW / 2;
    const keyholeY = bodyY + bodyH * 0.42;

    const sCX = bodyX + bodyW / 2;
    const sCY = bodyY + 2;
    const sOuterW = bodyW * 0.62;
    const sInnerW = bodyW * 0.38;
    const sHeight = bodyW * 0.55;

    function roundedRect(x: number, y: number, rw: number, rh: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + rw - r, y);
        ctx.arcTo(x + rw, y, x + rw, y + r, r);
        ctx.lineTo(x + rw, y + rh - r);
        ctx.arcTo(x + rw, y + rh, x + rw - r, y + rh, r);
        ctx.lineTo(x + r, y + rh);
        ctx.arcTo(x, y + rh, x, y + rh - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }

    function shacklePath() {
        ctx.beginPath();
        ctx.moveTo(sCX - sOuterW / 2, sCY);
        ctx.lineTo(sCX - sOuterW / 2, sCY - sHeight + sOuterW / 2);
        ctx.arc(sCX, sCY - sHeight + sOuterW / 2, sOuterW / 2, Math.PI, 0);
        ctx.lineTo(sCX + sOuterW / 2, sCY);
        ctx.lineTo(sCX + sInnerW / 2, sCY);
        ctx.lineTo(sCX + sInnerW / 2, sCY - sHeight + sOuterW / 2);
        ctx.arc(sCX, sCY - sHeight + sOuterW / 2, sInnerW / 2, 0, Math.PI, true);
        ctx.lineTo(sCX - sInnerW / 2, sCY);
        ctx.closePath();
    }

    function isInKeyhole(px: number, py: number): boolean {
        const dx = px - keyholeX;
        const dy = py - (keyholeY - 6);
        if (dx * dx + dy * dy < 15 * 15) return true;
        if (py >= keyholeY + 2 && py <= keyholeY + 38) {
            const t = (py - keyholeY - 2) / 36;
            const halfW = 8 + 7 * t;
            if (Math.abs(px - keyholeX) < halfW) return true;
        }
        return false;
    }

    // 3D depth faces
    const depthX = 8, depthY = 6;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyW, bodyY + bodyR);
    ctx.lineTo(bodyX + bodyW + depthX, bodyY + bodyR + depthY);
    ctx.lineTo(bodyX + bodyW + depthX, bodyY + bodyH + depthY);
    ctx.lineTo(bodyX + bodyW, bodyY + bodyH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyR, bodyY + bodyH);
    ctx.lineTo(bodyX + bodyR + depthX, bodyY + bodyH + depthY);
    ctx.lineTo(bodyX + bodyW + depthX, bodyY + bodyH + depthY);
    ctx.lineTo(bodyX + bodyW, bodyY + bodyH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(sCX + sOuterW / 2, sCY); ctx.lineTo(sCX + sOuterW / 2 + depthX, sCY + depthY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sCX + sOuterW / 2, sCY - sHeight + sOuterW / 2); ctx.lineTo(sCX + sOuterW / 2 + depthX, sCY - sHeight + sOuterW / 2 + depthY); ctx.stroke();

    // Body dot grid
    ctx.save();
    roundedRect(bodyX, bodyY, bodyW, bodyH, bodyR);
    ctx.clip();

    const dotSpacing = 3.5;
    for (let gx = bodyX; gx < bodyX + bodyW; gx += dotSpacing) {
        for (let gy = bodyY; gy < bodyY + bodyH; gy += dotSpacing) {
            if (isInKeyhole(gx, gy)) continue;
            const edgeDistX = Math.min(gx - bodyX, bodyX + bodyW - gx);
            const edgeDistY = Math.min(gy - bodyY, bodyY + bodyH - gy);
            const edgeDist = Math.min(edgeDistX, edgeDistY);
            const alpha = edgeDist < 5 ? 0.50 : edgeDist < 12 ? 0.25 : 0.10;
            const size = edgeDist < 5 ? 1.2 : edgeDist < 12 ? 0.9 : 0.6;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(gx - size / 2, gy - size / 2, size, size);
        }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 20; i++) {
        const gx = bodyX + (i / 20) * bodyW;
        ctx.beginPath(); ctx.moveTo(gx, bodyY); ctx.lineTo(gx, bodyY + bodyH); ctx.stroke();
    }
    for (let i = 1; i < 16; i++) {
        const gy = bodyY + (i / 16) * bodyH;
        ctx.beginPath(); ctx.moveTo(bodyX, gy); ctx.lineTo(bodyX + bodyW, gy); ctx.stroke();
    }
    ctx.restore();

    // Shackle dot grid
    ctx.save();
    shacklePath();
    ctx.clip();
    for (let gx = sCX - sOuterW / 2 - 2; gx < sCX + sOuterW / 2 + 2; gx += dotSpacing) {
        for (let gy = sCY - sHeight - 2; gy < sCY + (sOuterW - sInnerW) / 2; gy += dotSpacing) {
            const dx = gx - sCX;
            const dy = gy - (sCY - sHeight + sOuterW / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const outerEdge = Math.abs(dist - sOuterW / 2);
            const innerEdge = Math.abs(dist - sInnerW / 2);
            const nearEdge = Math.min(outerEdge, innerEdge);
            const alpha = nearEdge < 4 ? 0.45 : nearEdge < 10 ? 0.2 : 0.08;
            const size = nearEdge < 4 ? 1.1 : 0.6;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(gx - size / 2, gy - size / 2, size, size);
        }
    }
    ctx.restore();

    // Wireframe outlines
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    roundedRect(bodyX, bodyY, bodyW, bodyH, bodyR);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.5;
    roundedRect(bodyX + 3, bodyY + 3, bodyW - 6, bodyH - 6, bodyR - 1);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5;
    shacklePath();
    ctx.stroke();

    return off;
}

export default function HeroLockCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const staticRef = useRef<HTMLCanvasElement | null>(null);
    const dimensionsRef = useRef({ w: 0, h: 0 });
    const visibleRef = useRef(true);

    const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
        const { w, h } = dimensionsRef.current;
        if (w === 0 || !staticRef.current || !visibleRef.current) return;

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(staticRef.current, 0, 0, w, h);

        // Animated keyhole glow
        const bodyW = w * 0.38;
        const bodyH = bodyW * 0.78;
        const bodyX = (w - bodyW) / 2;
        const bodyY = h * 0.40;
        const keyholeX = bodyX + bodyW / 2;
        const keyholeY = bodyY + bodyH * 0.42;

        const aR = 55 + Math.sin(time * 0.0015) * 8;
        const aG = ctx.createRadialGradient(keyholeX, keyholeY + 8, 0, keyholeX, keyholeY + 8, aR);
        aG.addColorStop(0, "rgba(255,220,160,0.5)");
        aG.addColorStop(0.3, "rgba(255,190,110,0.25)");
        aG.addColorStop(0.6, "rgba(255,170,80,0.08)");
        aG.addColorStop(1, "rgba(255,150,50,0)");
        ctx.fillStyle = aG;
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY + 8, aR, 0, Math.PI * 2); ctx.fill();

        const cR = 25 + Math.sin(time * 0.002) * 4;
        const cG = ctx.createRadialGradient(keyholeX, keyholeY + 2, 0, keyholeX, keyholeY + 2, cR);
        cG.addColorStop(0, "rgba(255,255,255,1)");
        cG.addColorStop(0.35, "rgba(255,248,235,0.75)");
        cG.addColorStop(0.7, "rgba(255,230,200,0.2)");
        cG.addColorStop(1, "rgba(255,210,170,0)");
        ctx.fillStyle = cG;
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY + 2, cR, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY - 6, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(keyholeX - 7, keyholeY + 2);
        ctx.lineTo(keyholeX - 13, keyholeY + 36);
        ctx.lineTo(keyholeX + 13, keyholeY + 36);
        ctx.lineTo(keyholeX + 7, keyholeY + 2);
        ctx.closePath();
        ctx.fill();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const observer = new IntersectionObserver(
            ([entry]) => { visibleRef.current = entry?.isIntersecting ?? true; },
            { threshold: 0.1 }
        );
        observer.observe(canvas);

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (!rect) return;
            const cw = rect.width, ch = rect.height;
            canvas.width = cw * DPR;
            canvas.height = ch * DPR;
            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            dimensionsRef.current = { w: cw, h: ch };
            staticRef.current = buildStaticLock(cw, ch);
        };

        resize();
        window.addEventListener("resize", resize);

        const animate = (t: number) => {
            draw(ctx, t);
            animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener("resize", resize);
            observer.disconnect();
        };
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none", willChange: "transform" }}
        />
    );
}
