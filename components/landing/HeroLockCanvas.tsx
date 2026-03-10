"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

// ─── Math & Generators ────────────────────────────────────────────────────────

function generatePadlockPoints() {
    // Separate arrays for 0s and 1s to allow different textures
    const pts0: number[] = [];
    const pts1: number[] = [];
    const step = 0.035; // Wider step to allow space for legible digits

    const addPoint = (x: number, y: number, z: number) => {
        if (Math.random() > 0.5) pts1.push(x, y, z);
        else pts0.push(x, y, z);
    };

    const bw = 2.2, bh = 2.0, bd = 0.9;

    const isKeyhole = (x: number, y: number) => {
        const circ = Math.sqrt(x * x + (y - 0.2) * (y - 0.2)) < 0.3;
        const stem = y <= 0.2 && y > -0.6 && Math.abs(x) < (0.12 + (y + 0.6) * 0.05);
        return circ || stem;
    };

    // Front / Back faces
    for (let x = -bw / 2; x <= bw / 2; x += step) {
        for (let y = -bh / 2; y <= bh / 2; y += step) {
            if (!isKeyhole(x, y)) {
                addPoint(x, y, bd / 2);
                if (Math.random() > 0.5) addPoint(x, y, -bd / 2);
            }
        }
    }

    // Top / Bottom / Sides
    for (let x = -bw / 2; x <= bw / 2; x += step) {
        for (let z = -bd / 2; z <= bd / 2; z += step) {
            addPoint(x, bh / 2, z);
            if (Math.random() > 0.6) addPoint(x, -bh / 2, z);
        }
    }
    for (let y = -bh / 2; y <= bh / 2; y += step) {
        for (let z = -bd / 2; z <= bd / 2; z += step) {
            addPoint(bw / 2, y, z);
            addPoint(-bw / 2, y, z);
        }
    }

    // Inner Keyhole Tunnel
    for (let z = -bd / 2; z <= bd / 2; z += step * 1.5) {
        for (let a = 0; a < Math.PI * 2; a += 0.06) {
            const r = 0.3;
            const x = r * Math.cos(a);
            const y = r * Math.sin(a) + 0.2;
            if (y > 0.0) {
                addPoint(x, y, z);
            }
        }
        for (let y = -0.6; y <= 0.2; y += step * 1.5) {
            const w = 0.12 + (y + 0.6) * 0.05;
            addPoint(w, y, z); addPoint(-w, y, z);
        }
    }

    // Shackle 
    const sr = 0.65, st = 0.25;
    for (let theta = 0; theta < Math.PI; theta += 0.05) {
        for (let phi = 0; phi < Math.PI * 2; phi += 0.15) {
            if (Math.random() > 0.1) {
                const vx = (sr + st * Math.cos(phi)) * Math.cos(theta);
                const vy = (sr + st * Math.cos(phi)) * Math.sin(theta);
                const vz = st * Math.sin(phi);
                addPoint(vx, vy + bh / 2 + 0.6, vz);
            }
        }
    }
    for (let y = 0; y <= 0.6; y += step) {
        for (let phi = 0; phi <= Math.PI * 2; phi += 0.15) {
            if (Math.random() > 0.1) {
                const z = st * Math.sin(phi);
                const x = st * Math.cos(phi);
                addPoint(sr + x, y + bh / 2, z);
                addPoint(-sr + x, y + bh / 2, z);
            }
        }
    }

    // Front-face "scanlines"
    for (let y = -bh / 2; y <= bh / 2; y += step * 1.5) {
        for (let x = -bw / 2; x <= bw / 2; x += step * 1.5) {
            if (!isKeyhole(x, y)) {
                if (Math.sin(x * 20) > 0.8 && Math.random() > 0.5) addPoint(x, y, bd / 2 + 0.015);
                if (Math.sin(y * 25) > 0.9 && Math.random() > 0.5) addPoint(x, y, bd / 2 + 0.015);
            }
        }
    }

    return {
        pts0: new Float32Array(pts0),
        pts1: new Float32Array(pts1)
    };
}

// Crisp Text Texture Generator
function createDigitTexture(char: string) {
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#ffffff";
    // Monospace crisp tech font
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 16, 16);
    return new THREE.CanvasTexture(c);
}

// Broad soft halo 
function createKeyholeHalo() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.05, "rgba(200, 230, 255, 0.8)");
    grad.addColorStop(0.3, "rgba(50, 130, 255, 0.15)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
}

export default function HeroLockCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020304);

        const cw = container.clientWidth, ch = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(30, cw / ch, 0.1, 100);
        camera.position.set(0, 0, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        // Maximize resolution for crisp text
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(cw, ch);
        container.appendChild(renderer.domElement);

        const tex0 = createDigitTexture("0");
        const tex1 = createDigitTexture("1");
        const haloTex = createKeyholeHalo();

        const { pts0, pts1 } = generatePadlockPoints();

        // Material settings optimized for text sprites
        const matParams = {
            size: 0.055, // Larger size to read characters
            transparent: true,
            opacity: 0.85,
            depthWrite: true,
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            alphaTest: 0.1 // Discard empty pixels to prevent z-fighting boxes
        };

        const geo0 = new THREE.BufferGeometry();
        geo0.setAttribute("position", new THREE.BufferAttribute(pts0, 3));
        const mat0 = new THREE.PointsMaterial({ ...matParams, map: tex0 });
        const points0 = new THREE.Points(geo0, mat0);

        const geo1 = new THREE.BufferGeometry();
        geo1.setAttribute("position", new THREE.BufferAttribute(pts1, 3));
        const mat1 = new THREE.PointsMaterial({ ...matParams, map: tex1 });
        const points1 = new THREE.Points(geo1, mat1);

        // ── Main Padlock Group ──
        const lockGroup = new THREE.Group();
        lockGroup.add(points0);
        lockGroup.add(points1);

        // ── Inside-Keyhole Intense Burst ──
        const coreBright = new THREE.Sprite(new THREE.SpriteMaterial({
            map: haloTex, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        coreBright.scale.set(1.8, 1.8, 1);
        coreBright.position.set(0, -0.1, 0.0);
        lockGroup.add(coreBright);

        lockGroup.rotation.y = -Math.PI / 4.5;
        lockGroup.position.set(2.5, -0.3, 0);

        scene.add(lockGroup);

        // ── Backgound Flare ──
        const coreStreak = new THREE.Sprite(new THREE.SpriteMaterial({
            map: haloTex, color: 0x88bbff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        coreStreak.scale.set(18.0, 0.4, 1);
        coreStreak.position.set(2, -0.4, -0.5);
        scene.add(coreStreak);

        // ── Background Echo Rings ──
        // Keep simple circular faint grid behind the lock
        const ringGeo = new THREE.RingGeometry(2, 6, 64, 5, 0, Math.PI * 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x446688, wireframe: true, transparent: true, opacity: 0.08, side: THREE.DoubleSide
        });
        const meshRing = new THREE.Mesh(ringGeo, ringMat);
        meshRing.position.set(2, 0, -5);
        scene.add(meshRing);

        // ── Animation ──
        let raf = 0;
        const clock = new THREE.Clock();

        const animate = () => {
            raf = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            lockGroup.position.y = -0.3 + Math.sin(t * 0.4) * 0.05;
            coreStreak.position.y = lockGroup.position.y - 0.1;

            meshRing.rotation.z = t * 0.05;

            coreBright.material.opacity = 0.8 + Math.sin(t * 8) * 0.2;
            coreStreak.material.opacity = 0.5 + Math.sin(t * 4) * 0.2;

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
        <div className="absolute inset-0 w-full h-full bg-[#020304] overflow-hidden" style={{ zIndex: 0 }}>
            <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* HUD Callouts with connecting exact-width horizontal lines */}
            <div className="absolute top-[25%] left-[20%] -translate-y-1/2 -translate-x-full">
                <div className="absolute top-1/2 left-[105%] w-[8vw] h-[1px] bg-[#1a2530]" />
                <div className="absolute top-1/2 left-[calc(105%+8vw)] w-[4px] h-[4px] bg-[#405060] rounded-full -translate-y-1/2" />

                <div className="border border-[#203040] bg-[#020406]/90 px-6 py-4 text-[11px] uppercase font-mono tracking-[0.2em] text-[#8aaaba] flex flex-col items-center">
                    <span className="mb-1.5 whitespace-nowrap">Bundle & Signal</span>
                    <span className="whitespace-nowrap">Detection</span>
                </div>
            </div>

            <div className="absolute top-[52%] left-[16%] -translate-y-1/2 -translate-x-full">
                <div className="absolute top-1/2 left-[105%] w-[12vw] h-[1px] bg-[#1a2530]" />
                <div className="absolute top-1/2 left-[calc(105%+12vw)] w-[4px] h-[4px] bg-[#405060] rounded-full -translate-y-1/2" />

                <div className="border border-[#203040] bg-[#020406]/90 px-6 py-4 text-[11px] uppercase font-mono tracking-[0.2em] text-[#8aaaba] whitespace-nowrap">
                    Smart Money Flow
                </div>
            </div>

            <div className="absolute top-[82%] left-[22%] -translate-y-1/2 -translate-x-full">
                <div className="absolute top-1/2 left-[105%] w-[10vw] h-[1px] bg-[#1a2530]" />
                <div className="absolute top-1/2 left-[calc(105%+10vw)] w-[4px] h-[4px] bg-[#405060] rounded-full -translate-y-1/2" />

                <div className="border border-[#203040] bg-[#020406]/90 px-6 py-4 text-[11px] uppercase font-mono tracking-[0.2em] text-[#8aaaba] whitespace-nowrap">
                    Wallet Intelligence
                </div>
            </div>

            <div className="absolute right-[22%] top-[58%] text-[9px] font-mono text-[#8a9aa0] leading-[1.8] pointer-events-none drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
                <div>//00101100 11010011 0001</div>
                <div>TX: 0x9f...a12c</div>
                <div className="flex items-center gap-1">
                    STATUS: <span className="line-through opacity-70">VERIFYING</span> ACTIVE
                </div>
                <div>GRID: ACTIVE</div>
            </div>

        </div>
    );
}
