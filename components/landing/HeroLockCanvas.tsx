"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

// ─── Math & Generators ────────────────────────────────────────────────────────
function generatePadlockPoints() {
    const pts: number[] = [];
    const step = 0.05; // Density of grid points

    const addPoint = (x: number, y: number, z: number) => pts.push(x, y, z);

    // Body dimensions
    const bw = 2.4, bh = 1.8, bd = 0.8;

    // Keyhole Shape Mask
    const isKeyhole = (x: number, y: number) => {
        const circ = Math.sqrt(x * x + (y - 0.1) * (y - 0.1)) < 0.35;
        const stem = y < 0.1 && y > -0.6 && Math.abs(x) < (0.18 - (y - 0.1) * 0.1);
        return circ || stem;
    };

    // Front / Back faces (Dense Grid)
    for (let x = -bw / 2; x <= bw / 2; x += step) {
        for (let y = -bh / 2; y <= bh / 2; y += step) {
            if (!isKeyhole(x, y)) {
                addPoint(x, y, bd / 2);
                addPoint(x, y, -bd / 2);
            }
        }
    }

    // Top / Bottom
    for (let x = -bw / 2; x <= bw / 2; x += step) {
        for (let z = -bd / 2; z <= bd / 2; z += step) {
            addPoint(x, bh / 2, z);
            addPoint(x, -bh / 2, z);
        }
    }

    // Left / Right
    for (let y = -bh / 2; y <= bh / 2; y += step) {
        for (let z = -bd / 2; z <= bd / 2; z += step) {
            addPoint(bw / 2, y, z);
            addPoint(-bw / 2, y, z);
        }
    }

    // Shackle Arc (Top Loop)
    const sr = 0.7, st = 0.3;
    for (let theta = 0; theta <= Math.PI; theta += 0.06) {
        for (let phi = 0; phi <= Math.PI * 2; phi += 0.15) {
            const vx = (sr + st * Math.cos(phi)) * Math.cos(theta);
            const vy = (sr + st * Math.cos(phi)) * Math.sin(theta);
            const vz = st * Math.sin(phi);
            addPoint(vx, vy + bh / 2 + 0.5, vz);
        }
    }

    // Shackle Legs
    for (let y = 0; y <= 0.5; y += step) {
        for (let phi = 0; phi <= Math.PI * 2; phi += 0.15) {
            const z = st * Math.sin(phi);
            const x = st * Math.cos(phi);
            addPoint(sr + x, y + bh / 2, z);
            addPoint(-sr + x, y + bh / 2, z);
        }
    }

    // Internal "data core" structure (faint sparse matrix inside the lock)
    for (let x = -bw / 2 + 0.2; x <= bw / 2 - 0.2; x += step * 3) {
        for (let y = -bh / 2 + 0.2; y <= bh / 2 - 0.2; y += step * 3) {
            for (let z = -bd / 2 + 0.2; z <= bd / 2 - 0.2; z += step * 3) {
                if (Math.random() > 0.5 && !isKeyhole(x, y)) {
                    addPoint(x, y, z);
                }
            }
        }
    }

    return new Float32Array(pts);
}

function generateRingProjPoints() {
    const pts: number[] = [];
    const zOffsets = [1.5, 2.5, 3.8, 5.5];

    // Solid dense dials floating backwards
    zOffsets.forEach((zo, i) => {
        const rad = 0.5 + i * 0.5; // Rings get larger as they move backwards
        for (let r = rad - 0.3; r <= rad; r += 0.04) {
            for (let a = 0; a < Math.PI * 2; a += 0.03) {
                // Cut gaps for techy separated dial look
                if ((a % (Math.PI / 4)) < 0.2) continue;
                // Outer jagged noise (binary code look)
                if (r >= rad - 0.04 && Math.random() > 0.6) continue;

                pts.push(r * Math.cos(a), r * Math.sin(a) + 0.1, zo);
            }
        }
    });

    // Connecting funnel cone connecting rings to keyhole
    for (let z = 0.5; z < 5.5; z += 0.1) {
        const rad = 0.3 + (z * 0.4);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            if (Math.random() > 0.3) {
                pts.push(rad * Math.cos(a), rad * Math.sin(a) + 0.1, z);
            }
        }
    }
    return new Float32Array(pts);
}

function createGlowDot() {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.2, "rgba(200, 240, 255, 0.8)");
    grad.addColorStop(0.5, "rgba(0, 150, 255, 0.2)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroLockCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        // Base dark void (as per reference)
        scene.background = new THREE.Color(0x040608);

        const cw = container.clientWidth, ch = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(38, cw / ch, 0.1, 100);
        camera.position.set(0, 0, 8.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(cw, ch);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const tex = createGlowDot();

        // ── Main Padlock Mesh ─────────────────────────────────────
        const lockGeo = new THREE.BufferGeometry();
        lockGeo.setAttribute("position", new THREE.BufferAttribute(generatePadlockPoints(), 3));
        const lockMat = new THREE.PointsMaterial({
            size: 0.045,
            map: tex,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0xeeffff
        });
        const lockPoints = new THREE.Points(lockGeo, lockMat);

        // ── Data Rings Mesh ────────────────────────────────
        const ringsGeo = new THREE.BufferGeometry();
        ringsGeo.setAttribute("position", new THREE.BufferAttribute(generateRingProjPoints(), 3));
        const ringsMat = new THREE.PointsMaterial({
            size: 0.04,
            map: tex,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0x88ccff
        });
        const ringsPoints = new THREE.Points(ringsGeo, ringsMat);

        // ── Blinding Keyhole Core Glow ──────────────────────
        const coreSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }));
        coreSprite.scale.set(1.8, 1.8, 1);
        coreSprite.position.set(0, -0.1, 0.4);

        const group = new THREE.Group();
        group.add(lockPoints);
        group.add(ringsPoints);
        group.add(coreSprite);

        // Orient exactly like the reference screenshot
        // Padlock sits on right side, faces left slightly, projecting rings left-backward
        group.rotation.x = -0.05;
        group.rotation.y = -0.7;
        group.position.set(2, 0, 0);

        scene.add(group);

        // ── Grid Background ────────────────────────────────
        const gridHelper = new THREE.GridHelper(20, 40, 0x112233, 0x0a111a);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.z = -3;
        scene.add(gridHelper);

        // ── Animation ─────────────────────────────────────
        let raf = 0;
        const clock = new THREE.Clock();

        const animate = () => {
            raf = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Very subtle idle floating and sway
            group.rotation.y = -0.7 + Math.sin(t * 0.2) * 0.05;
            group.position.y = Math.sin(t * 0.4) * 0.1;

            // Rings rotating over time like dials
            ringsPoints.rotation.z = t * 0.1;
            ringsPoints.material.opacity = 0.6 + Math.sin(t * 5) * 0.15;

            // Core pulsing
            coreSprite.material.opacity = 0.8 + Math.sin(t * 8) * 0.2;
            coreSprite.scale.setScalar(1.6 + Math.sin(t * 4) * 0.2);

            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            const nw = container.clientWidth, nh = container.clientHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full bg-[#020406] overflow-hidden" style={{ zIndex: 0 }}>
            {/* 3D Canvas */}
            <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Connecting lines SVG matches UI placement */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#304050] stroke-[1px] fill-none opacity-80" preserveAspectRatio="none">
                {/* Line from top left shackle to BUNDLE & SIGNAL */}
                <path d="M 55% 30% L 35% 30% L 35% 25% L 26% 25%" />
                {/* Line from middle rings to SMART MONEY FLOW */}
                <path d="M 45% 45% L 30% 45% L 30% 38% L 20% 38%" />
                {/* Line from bottom rings to WALLET INTELLIGENCE */}
                <path d="M 38% 65% L 25% 65% L 25% 82% L 20% 82%" />
            </svg>

            {/* Floating HUD Annotations (Left Side) */}
            <div className="absolute top-1/4 left-[8%] flex flex-col items-end gap-20 text-[10px] uppercase font-mono tracking-[0.2em] text-[#a0c0d0]">
                {/* Bundle Detection */}
                <div className="flex items-center gap-4 translate-y-[-100%]">
                    <div className="border border-[#304050] bg-[#04080c]/90 px-4 py-2 flex flex-col items-center">
                        <span className="mb-1">Bundle & Signal</span>
                        <span>Detection</span>
                    </div>
                </div>

                {/* Smart Money Flow */}
                <div className="flex items-center gap-4 translate-x-[-20%]">
                    <div className="border border-[#304050] bg-[#04080c]/90 px-4 py-2">
                        Smart Money Flow
                    </div>
                </div>
            </div>

            {/* Wallet Intelligence */}
            <div className="absolute bottom-[16%] left-[10%] text-[10px] uppercase font-mono tracking-[0.2em] text-[#a0c0d0]">
                <div className="border border-[#304050] bg-[#04080c]/90 px-4 py-2">
                    Wallet Intelligence
                </div>
            </div>


        </div>
    );
}
