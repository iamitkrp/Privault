"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function HeroLockCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const cw = container.clientWidth, ch = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(40, cw / ch, 0.1, 100);
        camera.position.set(0, 0, 3.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(cw, ch);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const group = new THREE.Group();
        group.rotation.x = 0.15; // slight tilt
        scene.add(group);

        const loader = new THREE.TextureLoader();

        // ===== EARTH GLOBE =====
        const earthGeo = new THREE.SphereGeometry(1, 64, 64);

        // Dark earth texture
        const earthMat = new THREE.MeshStandardMaterial({
            color: 0x112244,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 0.95,
        });

        loader.load(
            "https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg",
            (texture) => {
                earthMat.map = texture;
                earthMat.color.set(0xffffff);
                earthMat.needsUpdate = true;
            },
            undefined,
            () => {
                // Fallback
                earthMat.color.set(0x0a1628);
            }
        );

        const earthMesh = new THREE.Mesh(earthGeo, earthMat);
        group.add(earthMesh);

        // ===== ATMOSPHERE GLOW =====
        const atmosGeo = new THREE.SphereGeometry(1.03, 64, 64);
        const atmosMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.FrontSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {},
            vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.8);
        }
      `,
        });
        group.add(new THREE.Mesh(atmosGeo, atmosMat));

        // Back-side outer glow
        const outerGlowMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {},
            vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.2, 0.5, 1.0, intensity * 0.5);
        }
      `,
        });
        group.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), outerGlowMat));

        // ===== WIREFRAME OVERLAY =====
        const wireGeo = new THREE.SphereGeometry(1.005, 36, 18);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x4488ff, wireframe: true, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending,
        });
        group.add(new THREE.Mesh(wireGeo, wireMat));

        // ===== CONNECTION POINTS & ARCS (Encrypted Data Traffic) =====
        const cities = [
            { name: "NY", lat: 40.7, lng: -74.0 },
            { name: "London", lat: 51.5, lng: -0.1 },
            { name: "Tokyo", lat: 35.7, lng: 139.7 },
            { name: "Sydney", lat: -33.9, lng: 151.2 },
            { name: "SF", lat: 37.8, lng: -122.4 },
            { name: "Singapore", lat: 1.3, lng: 103.8 },
            { name: "Berlin", lat: 52.5, lng: 13.4 },
            { name: "Paris", lat: 48.9, lng: 2.4 },
            { name: "Delhi", lat: 28.6, lng: 77.2 },
            { name: "São Paulo", lat: -23.5, lng: -46.6 },
            { name: "Moscow", lat: 55.8, lng: 37.6 },
            { name: "Dubai", lat: 25.2, lng: 55.2 },
            { name: "Cape Town", lat: -33.9, lng: 18.4 },
        ];

        const getVectorFromLatLng = (lat: number, lng: number, radius = 1) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            return new THREE.Vector3(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        };

        const pointGroup = new THREE.Group();
        earthMesh.add(pointGroup); // attach to earth so they rotate with it

        const dotGeometry = new THREE.SphereGeometry(0.012, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xaaccff });

        // Node Sprites Map
        const nodeSprites: THREE.Sprite[] = [];
        const cityVectors: THREE.Vector3[] = [];

        // Create a generic glow texture for nodes
        const nodeGlowCanvas = document.createElement("canvas");
        nodeGlowCanvas.width = 32; nodeGlowCanvas.height = 32;
        const ngCtx = nodeGlowCanvas.getContext("2d")!;
        const ngGrad = ngCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        ngGrad.addColorStop(0, "rgba(150,200,255,1)");
        ngGrad.addColorStop(0.4, "rgba(80,140,255,0.4)");
        ngGrad.addColorStop(1, "rgba(40,90,255,0)");
        ngCtx.fillStyle = ngGrad; ngCtx.fillRect(0, 0, 32, 32);
        const nodeTex = new THREE.CanvasTexture(nodeGlowCanvas);
        const spriteMat = new THREE.SpriteMaterial({ map: nodeTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });

        for (const city of cities) {
            const pos = getVectorFromLatLng(city.lat, city.lng, 1.002);
            cityVectors.push(pos);

            // Core dot
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.copy(pos);
            pointGroup.add(dot);

            // Glow sprite
            const sprite = new THREE.Sprite(spriteMat.clone());
            sprite.scale.set(0.12, 0.12, 1);
            sprite.position.copy(pos);
            pointGroup.add(sprite);
            nodeSprites.push(sprite);
        }

        // --- ARCS for Network Traffic ---
        const arcGroup = new THREE.Group();
        earthMesh.add(arcGroup);

        // Create random arcs between cities
        const arcCount = 15;
        const arcs: { mesh: THREE.Line; progress: number; speed: number; material: THREE.LineDashedMaterial }[] = [];

        for (let i = 0; i < arcCount; i++) {
            const i1 = Math.floor(Math.random() * cities.length);
            let i2 = Math.floor(Math.random() * cities.length);
            while (i2 === i1) i2 = Math.floor(Math.random() * cities.length);

            const v1 = cityVectors[i1]!;
            const v2 = cityVectors[i2]!;

            const dist = v1.distanceTo(v2);
            // Create a quadratic bezier curve for the arc, popping out from the sphere
            const midPoint = v1.clone().lerp(v2, 0.5);
            midPoint.normalize().multiplyScalar(1 + dist * 0.3); // Pop out relative to distance

            const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
            const points = curve.getPoints(30);
            const geo = new THREE.BufferGeometry().setFromPoints(points);

            const mat = new THREE.LineDashedMaterial({
                color: 0x66ccff,
                linewidth: 1,
                transparent: true,
                opacity: 0.8,
                dashSize: dist * 0.15,
                gapSize: 10, // Basically hiding the rest of the line
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const line = new THREE.Line(geo, mat);
            line.computeLineDistances();
            arcGroup.add(line);

            arcs.push({
                mesh: line,
                progress: Math.random() * 10,
                speed: 0.05 + Math.random() * 0.05,
                material: mat
            });
        }

        // ===== DATA PARTICLES ORBITING ALONG RINGS =====
        const ringGroup = new THREE.Group();
        group.add(ringGroup);

        const createRing = (radius: number, tiltX: number, tiltZ: number, particles: number) => {
            const g = new THREE.Group();

            // Dashed subtle ring
            const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
            const pts = curve.getPoints(100);
            const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
            const mat = new THREE.LineDashedMaterial({
                color: 0x4488ff, transparent: true, opacity: 0.08, dashSize: 0.1, gapSize: 0.05,
            });
            const line = new THREE.Line(geo, mat);
            line.computeLineDistances();
            g.add(line);

            // Data nodes on the ring
            const pGroup = new THREE.Group();
            for (let i = 0; i < particles; i++) {
                const nodeMat = new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
                const node = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 4), nodeMat);
                const a = (i / particles) * Math.PI * 2;
                node.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
                node.rotation.x = Math.PI / 2;
                node.rotation.z = -a;
                pGroup.add(node);
            }
            g.add(pGroup);

            g.rotation.x = tiltX;
            g.rotation.z = tiltZ;
            ringGroup.add(g);
            return { group: g, nodes: pGroup };
        };

        const rings = [
            createRing(1.5, 1.2, 0.2, 5),
            createRing(1.7, 0.4, -0.6, 8),
            createRing(1.9, -0.5, 0.4, 6),
        ];

        // ===== LIGHTING =====
        const dirLight = new THREE.DirectionalLight(0x66aaff, 1.2);
        dirLight.position.set(-5, 3, 4);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffaa66, 0.3); // Warm rim light
        dirLight2.position.set(5, -2, -3);
        scene.add(dirLight2);

        const ambLight = new THREE.AmbientLight(0x0a1628, 2.0);
        scene.add(ambLight);

        // ===== ANIMATION =====
        let raf = 0;
        const clock = new THREE.Clock();

        const animate = () => {
            raf = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Earth rotation
            earthMesh.rotation.y = t * 0.05;
            wireGeo.rotateY(0.0003); // Wireframe slowly drags relative to earth

            // Node pulsing (attached to earth, so they spin with it)
            for (let i = 0; i < nodeSprites.length; i++) {
                const sp = nodeSprites[i]!;
                sp.material.opacity = 0.4 + Math.sin(t * 3 + i) * 0.6;
                sp.scale.setScalar(0.1 + Math.sin(t * 2 + i) * 0.04);
            }

            // Animating Arcs (Data Transfer)
            for (const arc of arcs) {
                arc.progress -= arc.speed * 0.1;
                if (arc.progress < -arc.mesh.geometry.attributes.lineDistance!.array[arc.mesh.geometry.attributes.lineDistance!.count - 1]!) {
                    arc.progress = 0; // Reset length
                    // Change random target logic could go here if we dynamically updated the geometry
                }
                arc.material.dashOffset = arc.progress;
            }

            // Animating Rings
            for (let i = 0; i < rings.length; i++) {
                const r = rings[i]!;
                r.nodes.rotation.y = -t * (0.1 + i * 0.05); // Spin nodes around ring
            }

            // Gentle Group float/tilt
            group.rotation.y = Math.sin(t * 0.1) * 0.1;
            group.rotation.x = 0.15 + Math.sin(t * 0.08) * 0.05;

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

    return <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none", zIndex: 0 }} />;
}
