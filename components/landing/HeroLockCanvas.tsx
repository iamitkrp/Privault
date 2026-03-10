"use client";

import { useRef, useEffect, useCallback } from "react";

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

export default function HeroLockCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const dimensionsRef = useRef({ w: 0, h: 0 });

    const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
        const { w, h } = dimensionsRef.current;
        if (w === 0) return;
        ctx.clearRect(0, 0, w, h);

        // ===== LOCK DIMENSIONS =====
        const bodyW = w * 0.32;
        const bodyH = bodyW * 0.78;
        const bodyX = w * 0.62;
        const bodyY = h * 0.42;
        const bodyR = 10;
        const keyholeX = bodyX + bodyW / 2;
        const keyholeY = bodyY + bodyH * 0.42;

        // Shackle
        const sCX = bodyX + bodyW / 2;
        const sCY = bodyY + 2;
        const sOuterW = bodyW * 0.62;
        const sInnerW = bodyW * 0.38;
        const sHeight = bodyW * 0.55;
        const sThick = (sOuterW - sInnerW) / 2;

        // ===== 3D DEPTH OFFSET =====
        const depthX = 8;
        const depthY = 6;

        // ===== HELPER: rounded rect path =====
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

        // ===== HELPER: shackle path =====
        function shacklePath(offsetX: number, offsetY: number) {
            ctx.beginPath();
            // Outer arch
            ctx.moveTo(sCX - sOuterW / 2 + offsetX, sCY + offsetY);
            ctx.lineTo(sCX - sOuterW / 2 + offsetX, sCY - sHeight + sOuterW / 2 + offsetY);
            ctx.arc(sCX + offsetX, sCY - sHeight + sOuterW / 2 + offsetY, sOuterW / 2, Math.PI, 0);
            ctx.lineTo(sCX + sOuterW / 2 + offsetX, sCY + offsetY);
            // Inner arch (reverse)
            ctx.lineTo(sCX + sInnerW / 2 + offsetX, sCY + offsetY);
            ctx.lineTo(sCX + sInnerW / 2 + offsetX, sCY - sHeight + sOuterW / 2 + offsetY);
            ctx.arc(sCX + offsetX, sCY - sHeight + sOuterW / 2 + offsetY, sInnerW / 2, 0, Math.PI, true);
            ctx.lineTo(sCX - sInnerW / 2 + offsetX, sCY + offsetY);
            ctx.closePath();
        }

        // ===== HELPER: keyhole check =====
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

        // ========== DRAW 3D DEPTH FACES ==========
        // Right depth face of body
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

        // Bottom depth face of body
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

        // Right depth of shackle
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 0.5;
        // Outer right pillar depth
        ctx.beginPath();
        ctx.moveTo(sCX + sOuterW / 2, sCY);
        ctx.lineTo(sCX + sOuterW / 2 + depthX, sCY + depthY);
        ctx.stroke();
        // Outer top-right depth
        ctx.beginPath();
        ctx.moveTo(sCX + sOuterW / 2, sCY - sHeight + sOuterW / 2);
        ctx.lineTo(sCX + sOuterW / 2 + depthX, sCY - sHeight + sOuterW / 2 + depthY);
        ctx.stroke();

        // ========== DRAW BODY FILL (structured dot grid) ==========
        ctx.save();
        roundedRect(bodyX, bodyY, bodyW, bodyH, bodyR);
        ctx.clip();

        // Dense structured dot grid
        const dotSpacing = 3;
        for (let gx = bodyX; gx < bodyX + bodyW; gx += dotSpacing) {
            for (let gy = bodyY; gy < bodyY + bodyH; gy += dotSpacing) {
                if (isInKeyhole(gx, gy)) continue;
                // Edge brightness
                const edgeDistX = Math.min(gx - bodyX, bodyX + bodyW - gx);
                const edgeDistY = Math.min(gy - bodyY, bodyY + bodyH - gy);
                const edgeDist = Math.min(edgeDistX, edgeDistY);
                const edgeGlow = edgeDist < 5 ? 0.55 : edgeDist < 12 ? 0.3 : 0.12;
                // Slight shimmer
                const shimmer = 0.85 + 0.15 * Math.sin(gx * 0.5 + gy * 0.3 + time * 0.001);
                const alpha = edgeGlow * shimmer;
                const size = edgeDist < 5 ? 1.3 : edgeDist < 12 ? 1.0 : 0.7;
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(gx - size / 2, gy - size / 2, size, size);
            }
        }

        // Horizontal data scan lines
        ctx.font = "6px monospace";
        ctx.textAlign = "left";
        const dataLines = [
            "0x4F 0xA2 0x7B 0x91 0xE3 0xCC 0x55 0xD8 0x19 0xFA 0xBE 0x3D 0x74 0xC8",
            "AES_BLOCK=256  KEY_ITER=100000  SALT_LEN=32  MODE=GCM",
            "0xBF 0x22 0x6D 0x48 0xA1 0x73 0xC9 0x5E 0x0B 0xD4 0x8F 0x16 0xE7 0x3A",
            "CIPHER=AES-256-GCM  IV=12  TAG=16  AUTH=VERIFIED",
            "0xE8 0x3C 0x70 0xAD 0x1F 0x96 0xB3 0x4A 0x82 0xD7 0x5F 0x09 0xCB 0x61",
            "SESSION=DERIVED  VAULT=LOCKED  HMAC=SHA-512  STATUS=PASS",
            "0x5A 0xC1 0x2E 0x7F 0xD0 0x43 0xB8 0x6C 0x15 0xE9 0xA4 0x37 0x8E 0x52",
        ];
        for (let i = 0; i < dataLines.length; i++) {
            const ly = bodyY + 20 + i * (bodyH / 8);
            const scrollOff = ((time * 0.015 + i * 50) % 400) - 100;
            const alpha = 0.06 + Math.sin(time * 0.001 + i) * 0.02;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillText(dataLines[i] || "", bodyX + 8 - scrollOff, ly);
        }
        ctx.restore();

        // ========== DRAW SHACKLE FILL (structured dots) ==========
        ctx.save();
        shacklePath(0, 0);
        ctx.clip();

        for (let gx = sCX - sOuterW / 2 - 2; gx < sCX + sOuterW / 2 + 2; gx += dotSpacing) {
            for (let gy = sCY - sHeight - 2; gy < sCY + sThick; gy += dotSpacing) {
                const dx = gx - sCX;
                const dy = gy - (sCY - sHeight + sOuterW / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Edge glow for shackle
                const outerEdge = Math.abs(dist - sOuterW / 2);
                const innerEdge = Math.abs(dist - sInnerW / 2);
                const nearEdge = Math.min(outerEdge, innerEdge);
                const edgeGlow = nearEdge < 4 ? 0.5 : nearEdge < 10 ? 0.25 : 0.1;
                const shimmer = 0.85 + 0.15 * Math.sin(gx * 0.4 + gy * 0.3 + time * 0.001);
                const alpha = edgeGlow * shimmer;
                const size = nearEdge < 4 ? 1.2 : 0.7;
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(gx - size / 2, gy - size / 2, size, size);
            }
        }
        ctx.restore();

        // ========== WIREFRAME OUTLINES ==========
        // Body outline
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.5;
        roundedRect(bodyX, bodyY, bodyW, bodyH, bodyR);
        ctx.stroke();

        // Inner body outline
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.5;
        roundedRect(bodyX + 3, bodyY + 3, bodyW - 6, bodyH - 6, bodyR - 1);
        ctx.stroke();

        // Shackle outline
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.5;
        shacklePath(0, 0);
        ctx.stroke();

        // ========== GRID LINES ON BODY ==========
        ctx.save();
        roundedRect(bodyX, bodyY, bodyW, bodyH, bodyR);
        ctx.clip();
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

        // ========== KEYHOLE GLOW ==========
        // Large warm aura
        const aR = 55 + Math.sin(time * 0.0015) * 8;
        const aG = ctx.createRadialGradient(keyholeX, keyholeY + 8, 0, keyholeX, keyholeY + 8, aR);
        aG.addColorStop(0, "rgba(255,220,160,0.5)");
        aG.addColorStop(0.3, "rgba(255,190,110,0.25)");
        aG.addColorStop(0.6, "rgba(255,170,80,0.08)");
        aG.addColorStop(1, "rgba(255,150,50,0)");
        ctx.fillStyle = aG;
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY + 8, aR, 0, Math.PI * 2); ctx.fill();

        // Bright core
        const cR = 25 + Math.sin(time * 0.002) * 4;
        const cG = ctx.createRadialGradient(keyholeX, keyholeY + 2, 0, keyholeX, keyholeY + 2, cR);
        cG.addColorStop(0, "rgba(255,255,255,1)");
        cG.addColorStop(0.35, "rgba(255,248,235,0.75)");
        cG.addColorStop(0.7, "rgba(255,230,200,0.2)");
        cG.addColorStop(1, "rgba(255,210,170,0)");
        ctx.fillStyle = cG;
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY + 2, cR, 0, Math.PI * 2); ctx.fill();

        // Keyhole shape
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath(); ctx.arc(keyholeX, keyholeY - 6, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(keyholeX - 7, keyholeY + 2);
        ctx.lineTo(keyholeX - 13, keyholeY + 36);
        ctx.lineTo(keyholeX + 13, keyholeY + 36);
        ctx.lineTo(keyholeX + 7, keyholeY + 2);
        ctx.closePath();
        ctx.fill();

        // ========== DATA RINGS ==========
        const ringsCY = h * 0.36;
        for (let i = 0; i < 5; i++) {
            const rx = w * 0.04 + i * w * 0.085;
            const rr = 20 + i * 8;
            const sqX = 0.30;
            const rotDir = i % 2 === 0 ? 1 : -1;
            const rot = time * rotDir * 0.0005 * (1 + i * 0.15);

            ctx.save();
            ctx.translate(rx, ringsCY);
            ctx.scale(sqX, 1);
            ctx.rotate(rot);

            // Rings
            for (let r = 0; r < 3; r++) {
                const cr = rr * (1 - r * 0.28);
                ctx.strokeStyle = `rgba(255,255,255,${0.35 - r * 0.1 + i * 0.03})`;
                ctx.lineWidth = r === 0 ? 1.5 : 0.8;
                ctx.setLineDash(r === 0 ? [] : r === 1 ? [3, 3] : [1, 3]);
                ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2); ctx.stroke();
            }

            // Center dot
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(255,255,255,${0.5 + i * 0.08})`;
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();

            // Tick marks
            for (let d = 0; d < 12; d++) {
                const a = (d / 12) * Math.PI * 2;
                ctx.strokeStyle = `rgba(255,255,255,${0.12 + Math.sin(time * 0.002 + d + i) * 0.08})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * rr * 0.88, Math.sin(a) * rr * 0.88);
                ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
                ctx.stroke();
            }
            ctx.restore();
        }

        // ========== CONVERGENCE CONE ==========
        const coneStart = w * 0.04 + 4 * w * 0.085 + 30;
        ctx.setLineDash([3, 5]);
        for (let i = 0; i < 8; i++) {
            const sy = ringsCY - 55 + i * (110 / 7);
            const al = 0.035 + Math.sin(time * 0.001 + i * 0.6) * 0.025;
            ctx.strokeStyle = `rgba(255,255,255,${al})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(coneStart, sy); ctx.lineTo(keyholeX, keyholeY); ctx.stroke();
        }
        ctx.setLineDash([]);

        // ========== LABELS ==========
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        const labels = [
            { text: "ENTROPY & BRUTE DETECT", x: w * 0.30, y: h * 0.08 },
            { text: "LIVE VAULT ENCRYPTION", x: w * 0.10, y: h * 0.22 },
            { text: "ZERO-KNOWLEDGE AUTH", x: w * 0.25, y: h * 0.55 },
            { text: "MASTER KEY INTELLIGENCE", x: w * 0.14, y: h * 0.73 },
            { text: "VAULT SECURITY", x: w * 0.07, y: h * 0.90 },
        ];
        for (const lb of labels) {
            const tw = ctx.measureText(lb.text).width;
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.strokeStyle = "rgba(255,255,255,0.18)";
            ctx.lineWidth = 0.5;
            ctx.fillRect(lb.x - 6, lb.y - 10, tw + 12, 16);
            ctx.strokeRect(lb.x - 6, lb.y - 10, tw + 12, 16);
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillText(lb.text, lb.x, lb.y + 2);

            // Connector dot
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.beginPath(); ctx.arc(lb.x + tw + 14, lb.y, 2, 0, Math.PI * 2); ctx.fill();
        }

        // ========== NETWORK GRAPH ==========
        const nx = w * 0.90, ny = h * 0.82;
        const nodes = [
            { x: 0, y: 0 }, { x: 22, y: -16 }, { x: -16, y: -22 },
            { x: 26, y: 12 }, { x: -12, y: 20 }, { x: 17, y: 27 },
            { x: -27, y: 6 }, { x: 10, y: -32 },
        ];
        const edges: [number, number][] = [
            [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 7], [3, 5], [4, 6], [2, 6], [5, 3], [7, 2],
        ];
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.5;
        for (const [a, b] of edges) {
            const nA = nodes[a], nB = nodes[b];
            if (!nA || !nB) continue;
            ctx.beginPath(); ctx.moveTo(nx + nA.x, ny + nA.y); ctx.lineTo(nx + nB.x, ny + nB.y); ctx.stroke();
        }
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (!n) continue;
            const p = 2.5 + Math.sin(time * 0.003 + i) * 1;
            ctx.fillStyle = i % 3 === 0 ? "rgba(255,130,60,0.9)" : "rgba(255,255,255,0.5)";
            ctx.beginPath(); ctx.arc(nx + n.x, ny + n.y, p, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "7px monospace";
        ctx.fillText("//TOP BUNDLES - 26N", nx - 32, ny - 40);

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

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
