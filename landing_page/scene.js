import * as THREE from 'three/webgpu';
import { color, float, vec3, normalize, positionWorld, cameraPosition, pow, max, dot, reflect, mix, uniform, materialReference, pass, mrt, output, normalView, normalWorld, metalness, roughness } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Dynamic import for GTAO and SSR (addons may fail in some environments)
let ao, denoise, ssrModule, bloomModule;
try {
    const gtaoMod = await import('three/addons/tsl/display/GTAONode.js');
    ao = gtaoMod.ao;
} catch (e) { console.warn('GTAO not available:', e.message); }
try {
    const denoiseMod = await import('three/addons/tsl/display/DenoiseNode.js');
    denoise = denoiseMod.denoise;
} catch (e) { console.warn('Denoise not available:', e.message); }
try {
    ssrModule = await import('three/addons/tsl/display/SSRNode.js');
} catch (e) { console.warn('SSR not available:', e.message); }
try {
    bloomModule = await import('three/addons/tsl/display/BloomNode.js');
} catch (e) { console.warn('Bloom not available:', e.message); }


// Scene setup
const scene = new THREE.Scene();
const sceneContainer = document.querySelector('.hero-scene') || document.getElementById('root')?.parentElement || document.body;
const containerW = () => sceneContainer.clientWidth || window.innerWidth;
const containerH = () => sceneContainer.clientHeight || window.innerHeight;

const camera = new THREE.PerspectiveCamera(40, containerW() / containerH(), 0.5, 500);
camera.position.set(0, 0, 80);
camera.lookAt(0, 0, 0);

let renderer;
try {
    renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setSize(containerW(), containerH());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const root = document.getElementById('root') ?? document.body;
    root.appendChild(renderer.domElement);
    await renderer.init();
    console.log('WebGPU renderer initialized');
} catch (e) {
    console.warn('WebGPU not available, falling back to WebGL:', e);
    renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL: true });
    renderer.setSize(containerW(), containerH());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const root = document.getElementById('root') ?? document.body;
    root.appendChild(renderer.domElement);
    await renderer.init();
}

// Procedural environment
const pmremGenerator = new THREE.PMREMGenerator(renderer);

function createSkyEnvironment() {
    const envScene = new THREE.Scene();
    const skyGeo = new THREE.SphereGeometry(50, 64, 32);
    const skyMat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide });
    const skyUV = normalWorld;

    // Beautiful warm gradient: deep indigo zenith → teal mid → peach/coral horizon
    const zenithColor = color(0x1a1a3e);    // deep indigo
    const midColor = color(0x0d6b7a);       // rich teal
    const horizonColor = color(0xf4a460);   // warm sandy peach
    const belowColor = color(0x2a1a3a);     // deep purple-black below

    // Upper sky: zenith to mid
    const upperBlend = pow(max(skyUV.y, float(0)), float(0.5));
    const upperSky = mix(midColor, zenithColor, upperBlend);

    // Horizon glow: warm peach/coral band at y≈0
    const horizonGlow = mix(horizonColor, midColor, pow(max(skyUV.y, float(0)), float(0.25)));

    // Blend upper sky with horizon
    const skyBlend = mix(horizonGlow, upperSky, pow(max(skyUV.y, float(0)), float(0.4)));

    // Below horizon: fade to dark purple
    const belowBlend = pow(max(float(0).sub(skyUV.y), float(0)), float(0.6));
    const finalSky = mix(skyBlend, belowColor, belowBlend);

    skyMat.colorNode = finalSky;
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    envScene.add(skyMesh);

    // Warm sun glow near horizon
    const sunGeo = new THREE.SphereGeometry(5, 16, 8);
    const sunMat = new THREE.MeshBasicNodeMaterial();
    sunMat.colorNode = color(0xffcc66).mul(float(4.0));
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(20, 5, -30);
    envScene.add(sunMesh);

    // Secondary warm glow
    const glow2Geo = new THREE.SphereGeometry(10, 12, 8);
    const glow2Mat = new THREE.MeshBasicNodeMaterial();
    glow2Mat.colorNode = color(0xff8844).mul(float(1.2));
    const glow2Mesh = new THREE.Mesh(glow2Geo, glow2Mat);
    glow2Mesh.position.set(20, 2, -30);
    envScene.add(glow2Mesh);

    // Subtle cyan accent glow opposite side
    const cyanGlowGeo = new THREE.SphereGeometry(6, 12, 8);
    const cyanGlowMat = new THREE.MeshBasicNodeMaterial();
    cyanGlowMat.colorNode = color(0x00bcd4).mul(float(0.8));
    const cyanGlowMesh = new THREE.Mesh(cyanGlowGeo, cyanGlowMat);
    cyanGlowMesh.position.set(-25, 15, 20);
    envScene.add(cyanGlowMesh);

    const envRT = pmremGenerator.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    scene.background = envRT.texture;
    scene.backgroundBlurriness = 0.6;
    scene.backgroundIntensity = 0.9;

    envScene.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    });
}
createSkyEnvironment();

// Lazy-load HDR for better reflections
const rgbeLoader = new RGBELoader();
requestIdleCallback(() => {
    rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        // Only use HDR for reflections, keep procedural gradient as background
        if (scene.environment) scene.environment.dispose();
        scene.environment = texture;
    });
}, { timeout: 3000 });


// === VOXEL INFRASTRUCTURE ===
const voxelSize = 1.0;
const step = voxelSize;
const voxelGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize, 1, 1, 1);

const occupiedPositions = new Set();
function posKey(x, y, z) {
    return `${Math.round(x * 100)},${Math.round(y * 100)},${Math.round(z * 100)}`;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const categoryBatches = {};
const voxelMats = [];
const voxels = [];

function createVoxel(name, x, y, z, hex, roughnessVal, metalnessVal, category) {
    const pk = posKey(x, y, z);
    if (occupiedPositions.has(pk)) return;
    occupiedPositions.add(pk);
    const cat = category || 'default';
    if (!categoryBatches[cat]) {
        categoryBatches[cat] = {
            rough: roughnessVal ?? 0.60,
            metal: metalnessVal ?? 0.15,
            geo: 'voxel',
            transforms: [],
            colors: []
        };
    }
    categoryBatches[cat].transforms.push({ x, y, z, sx: 1, sy: 1, sz: 1, rx: 0, rz: 0 });
    categoryBatches[cat].colors.push(hex);
}

const categoryMatPresets = {
    lockBody:    { rough: 0.25, metal: 0.85, clearcoat: 0.8, physical: true },
    shackle:     { rough: 0.20, metal: 0.90, clearcoat: 0.9, physical: true },
    keyhole:     { rough: 0.10, metal: 0.95, clearcoat: 1.0, physical: true },
    keyholeInner:{ rough: 0.95, metal: 0.05, clearcoat: 0, physical: false },
    accent:      { rough: 0.30, metal: 0.80, clearcoat: 0.6, physical: true },
    glow:        { rough: 0.10, metal: 0.00, clearcoat: 0, physical: false },
    particle:    { rough: 0.50, metal: 0.30, clearcoat: 0.3, physical: true },
};

// Geometry cache
const geoCache = { 'voxel': voxelGeo };
function getGeo(key, sx, sy, sz) {
    if (key === 'voxel') return voxelGeo;
    if (!geoCache[key]) {
        geoCache[key] = new THREE.BoxGeometry(voxelSize * sx, voxelSize * sy, voxelSize * sz);
    }
    return geoCache[key];
}

function buildInstancedMeshes() {
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();
    for (const catKey in categoryBatches) {
        const batch = categoryBatches[catKey];
        const count = batch.transforms.length;
        if (count === 0) continue;

        const baseCat = catKey.split('|')[0];
        const preset = categoryMatPresets[baseCat] || { rough: 0.40, metal: 0.60, clearcoat: 0.5, physical: true };

        let mat;
        if (preset.physical) {
            mat = new THREE.MeshPhysicalNodeMaterial();
            mat.clearcoat = preset.clearcoat;
            mat.clearcoatRoughness = 0.3;
            mat.reflectivity = 0.5;
            mat.ior = 2.0;
        } else {
            mat = new THREE.MeshStandardNodeMaterial();
        }
        mat.color = new THREE.Color(0xffffff);
        mat.roughness = preset.rough;
        mat.metalness = preset.metal;
        mat.envMapIntensity = 1.8;
        mat.flatShading = true;
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 1;
        mat.polygonOffsetUnits = 1;
        voxelMats.push(mat);

        let geo;
        if (batch.geo === 'voxel') {
            geo = voxelGeo;
        } else {
            const parts = batch.geo.split('_').map(Number);
            geo = getGeo(batch.geo, parts[0], parts[1], parts[2]);
        }

        const im = new THREE.InstancedMesh(geo, mat, count);
        im.name = 'cat_' + catKey.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
        im.castShadow = true;
        im.receiveShadow = true;

        for (let i = 0; i < count; i++) {
            const t = batch.transforms[i];
            dummy.position.set(t.x, t.y, t.z);
            dummy.rotation.set(t.rx, 0, t.rz);
            dummy.scale.set(t.sx, t.sy, t.sz);
            dummy.updateMatrix();
            im.setMatrixAt(i, dummy.matrix);
            tmpColor.set(batch.colors[i]);
            im.setColorAt(i, tmpColor);
        }
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.frustumCulled = true;

        scene.add(im);
        voxels.push(im);
    }
    console.log(`Built ${voxels.length} instanced meshes`);
}


// ================================================================
// === 3D VOXEL SHIELD ===
// ================================================================

// Color palettes — Blue and Silver Frost
const shieldBodyColors = ['#408df5', '#4993f7', '#5a9efa', '#3680e8']; // Rich blue core
const shieldBodyDarkColors = ['#286ce0', '#2060d4', '#1d57c2', '#184db0']; // Deeper blue
const shieldBodyLightColors = ['#eaf3ff', '#f5f9ff', '#ffffff']; // Frosted white/glass
const borderColors = ['#ffffff', '#fdfdfd', '#f8fbfc']; // Pure white silver border
const checkColors = ['#eaf3ff', '#ffffff', '#e2edfa'];
const glowColors = ['#73aeff', '#8cbfff', '#a3ccff', '#baddff']; // Soft blue aura
const darkInnerColors = ['#1a1a2e']; // Unused but kept for structural compatibility

// ================================================================
// --- DOUBLE SHIELD SHAPE ---
// ================================================================

const largeShield = [
    "B                       B", // 24
    "BB                     BB", // 23
    "BCB                   BCB", // 22
    "BCCB                 BCCB", // 21
    "BCCCBB             BBCCCB", // 20
    "BCCCCCBB         BBCCCCCB", // 19
    "BCCCCCCCBB     BBCCCCCCCB", // 18
    "BCCCCCCCCCBB BBCCCCCCCCCB", // 17
    "BCCCCCCCCCCCBCCCCCCCCCCCB", // 16
    "BCCCCCCCCCCCCCCCCKCCCCCCB", // 15
    "BCCCCCCCCCCCCCCCKKCCCCCCB", // 14
    "BCCCCCCCCCCCCCCKKCCCCCCCB", // 13
    "BCCCCCCCKCCCCCKKCCCCCCCCB", // 12
    "BCCCCCCCCKCCCKKCCCCCCCCCB", // 11
    " BCCCCCCCCKCKKCCCCCCCCCB ", // 10
    " BCCCCCCCCCKKCCCCCCCCCCB ", // 9
    "  BCCCCCCCCCCCCCCCCCCCB  ", // 8
    "   BCCCCCCCCCCCCCCCCCB   ", // 7
    "    BCCCCCCCCCCCCCCCB    ", // 6
    "     BCCCCCCCCCCCCCB     ", // 5
    "      BCCCCCCCCCCCB      ", // 4
    "       BCCCCCCCCCB       ", // 3
    "        BCCCCCCCB        ", // 2
    "         BCCCCCB         ", // 1
    "          BCCCB          ", // 0
    "            B            "  // -1
];

const smallShield = [
    "B               B", // 16
    "BB             BB", // 15
    "BCB           BCB", // 14
    "BCCB         BCCB", // 13
    "BCCCBB     BBCCCB", // 12
    "BCCCCCBB BBCCCCCB", // 11
    "BCCCCCCCBCCCCCCCB", // 10
    "BCCCCCCCCCCCCCCCB", // 9
    "BCCCCCCCCCCCCCCCB", // 8
    " BCCCCCCCCCCCCCB ", // 7
    "  BCCCCCCCCCCCB  ", // 6
    "   BCCCCCCCCCB   ", // 5
    "    BCCCCCCCB    ", // 4
    "     BCCCCCB     ", // 3
    "      BCCCB      ", // 2
    "       BCB       ", // 1
    "        B        "  // 0
];

const scale = 2; // Enlarges 1 grid tile to 2x2x2 voxels for higher detail/size

// --- 1. Draw Large Back Shield ---
const largeH = largeShield.length; 
const largeW = largeShield[0].length; 
const largeZ = -3;
const largeDepth = 3;

for (let r=0; r<largeH; r++) {
    const y = largeH - 1 - r; 
    for (let c=0; c<largeW; c++) {
        const char = largeShield[r][c];
        if (char === ' ') continue;

        const px = (c - 12);
        const py = y - 10; 

        for (let dx=0; dx<scale; dx++) {
            for (let dy=0; dy<scale; dy++) {
                for (let dz=0; dz<largeDepth*scale; dz++) {
                    const vx = px * scale + dx;
                    const vy = py * scale + dy;
                    const vz = largeZ * scale + dz;

                    const isFrontBack = (dz === 0 || dz === largeDepth*scale - 1);
                    const isFrontMost = dz === largeDepth*scale - 1;

                    let color, cat;
                    if (char === 'B') {
                        color = pickRandom(borderColors);
                        cat = isFrontMost ? 'accent' : 'lockBody'; 
                    } else if (char === 'C') {
                        if (isFrontBack) {
                             color = pickRandom(shieldBodyLightColors);
                        } else {
                             color = pickRandom(shieldBodyColors);
                        }
                        cat = 'lockBody';
                    } else if (char === 'K') {
                        color = pickRandom(checkColors);
                        cat = 'accent';
                    }

                    // Extrude the Checkmark outward 3D on the front face
                    if (char === 'K' && isFrontMost) {
                         for (let eqz=1; eqz<=scale; eqz++) {
                             createVoxel(`main_k_bump_${r}_${c}_${dx}_${dy}_${eqz}`, vx * step, vy * step + 0.5, (vz + eqz) * step, color, 0.40, 0.60, 'accent');
                         }
                    }

                    createVoxel(`main_${r}_${c}_${dx}_${dy}_${dz}`, vx * step, vy * step + 0.5, vz * step, color, 0.40, 0.60, cat);
                }
            }
        }
    }
}

// --- 2. Draw Small Overlapping Front Shield ---
const smallH = smallShield.length; 
const smallW = smallShield[0].length; 
const smallZ = largeZ + largeDepth + 1; 
const smallDepth = 1.5;

for (let r=0; r<smallH; r++) {
    const y = smallH - 1 - r;
    for (let c=0; c<smallW; c++) {
        const char = smallShield[r][c];
        if (char === ' ') continue;

        const px = (c - 8) - 7; // Shifted left
        const py = y - 13;      // Shifted down

        for (let dx=0; dx<scale; dx++) {
            for (let dy=0; dy<scale; dy++) {
                for (let dz=0; dz<smallDepth*scale; dz++) {
                    const vx = px * scale + dx;
                    const vy = py * scale + dy;
                    const vz = smallZ * scale + dz;

                    let color, cat;
                    if (char === 'B') {
                        color = pickRandom(borderColors);
                        cat = 'accent';
                    } else {
                        color = pickRandom(shieldBodyLightColors); 
                        cat = 'lockBody';
                    }

                    createVoxel(`sec_${r}_${c}_${dx}_${dy}_${dz}`, vx * step, vy * step + 0.5, vz * step, color, 0.20, 0.90, cat);

                    // Keep front border raised to give rim effect
                    if (char === 'B' && dz === Math.floor(smallDepth*scale) - 1) {
                        for (let eqz=1; eqz<=Math.floor(scale/2); eqz++) {
                             createVoxel(`sec_bump_${r}_${c}_${dx}_${dy}_${eqz}`, vx * step, vy * step + 0.5, (vz + eqz) * step, pickRandom(borderColors), 0.20, 0.90, 'accent');
                        }
                    }
                }
            }
        }
    }
}

// --- FLOATING PARTICLES ---
const particlePositions = [];
for (let i = 0; i < 60; i++) {
    const px = Math.random() * 80 - 40;
    const py = Math.random() * 60 - 30;
    const pz = Math.random() * 40 - 20;
    const c = Math.random() < 0.4 ? pickRandom(glowColors) : pickRandom(shieldBodyLightColors);
    createVoxel(`particle_${i}`, px, py, pz, c, 0.30, 0.50, 'particle');
    particlePositions.push({ x: px, y: py, z: pz });
}


// === BUILD ALL INSTANCED MESHES ===
buildInstancedMeshes();

// === INSTANCE DATA ===
const instanceData = new Map();
const _islandBBox = new THREE.Box3();

{
    const dummy = new THREE.Object3D();
    const mat4 = new THREE.Matrix4();
    voxels.forEach(im => {
        const count = im.count;
        const orig = new Float32Array(count * 3);
        const offsets = new Float32Array(count * 3);
        const randDirs = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            im.getMatrixAt(i, mat4);
            mat4.decompose(dummy.position, dummy.quaternion, dummy.scale);
            orig[i * 3] = dummy.position.x;
            orig[i * 3 + 1] = dummy.position.y;
            orig[i * 3 + 2] = dummy.position.z;
            _islandBBox.expandByPoint(dummy.position);

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            randDirs[i * 3] = Math.sin(phi) * Math.cos(theta);
            randDirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
            randDirs[i * 3 + 2] = Math.cos(phi);
        }
        instanceData.set(im, { origPositions: orig, offsets, randDirs, count });
    });
    _islandBBox.expandByScalar(3.0);
}


// === PARTICLE SYSTEM — floating glowing motes ===
const particleGroup = new THREE.Group();
particleGroup.name = 'particleGroup';
scene.add(particleGroup);

// Dust motes
const dustCount = 100;
const dustGeo = new THREE.BufferGeometry();
const dustPositions2 = new Float32Array(dustCount * 3);
const dustVelocities = new Float32Array(dustCount * 3);
const dustSizes = new Float32Array(dustCount);
const dustLifetimes = new Float32Array(dustCount);
const dustSpeeds = new Float32Array(dustCount);

for (let i = 0; i < dustCount; i++) {
    dustPositions2[i * 3] = (Math.random() - 0.5) * 40;
    dustPositions2[i * 3 + 1] = Math.random() * 30 - 5;
    dustPositions2[i * 3 + 2] = (Math.random() - 0.5) * 30;
    dustVelocities[i * 3] = (Math.random() - 0.5) * 0.2;
    dustVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    dustVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    dustSizes[i] = 0.15 + Math.random() * 0.2;
    dustLifetimes[i] = Math.random();
    dustSpeeds[i] = 0.02 + Math.random() * 0.03;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions2, 3));
dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));

const dustMat = new THREE.PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
});
dustMat.colorNode = color(0xff9800);
dustMat.opacityNode = float(0.5);

const dustPoints = new THREE.Points(dustGeo, dustMat);
dustPoints.name = 'dustMotes';
dustPoints.frustumCulled = false;
particleGroup.add(dustPoints);

function updateParticles(dt) {
    const dtCl = Math.min(dt, 0.05);
    const time = performance.now() * 0.001;

    const dPos = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
        dustLifetimes[i] += dustSpeeds[i] * dtCl;
        if (dustLifetimes[i] > 1) dustLifetimes[i] -= 1;

        dPos[i * 3] += (dustVelocities[i * 3] + Math.sin(time * 0.5 + i * 0.7) * 0.1) * dtCl;
        dPos[i * 3 + 1] += (dustVelocities[i * 3 + 1] + Math.sin(time * 0.3 + i * 1.1) * 0.06) * dtCl;
        dPos[i * 3 + 2] += (dustVelocities[i * 3 + 2] + Math.cos(time * 0.4 + i * 0.9) * 0.1) * dtCl;

        if (dPos[i * 3] > 22) dPos[i * 3] = -22;
        if (dPos[i * 3] < -22) dPos[i * 3] = 22;
        if (dPos[i * 3 + 1] > 30) dPos[i * 3 + 1] = -5;
        if (dPos[i * 3 + 1] < -5) dPos[i * 3 + 1] = 30;
        if (dPos[i * 3 + 2] > 16) dPos[i * 3 + 2] = -16;
        if (dPos[i * 3 + 2] < -16) dPos[i * 3 + 2] = 16;
    }
    dustGeo.attributes.position.needsUpdate = true;

    // Animate floating particle voxels with gentle bobbing
    voxels.forEach(im => {
        if (!im.name.startsWith('cat_particle')) return;
        const data = instanceData.get(im);
        if (!data) return;
        const count = data.count;
        const dummy = new THREE.Object3D();
        const mat4tmp = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            const ox = data.origPositions[i * 3];
            const oy = data.origPositions[i * 3 + 1];
            const oz = data.origPositions[i * 3 + 2];
            const bob = Math.sin(time * 0.8 + ox * 0.5 + oz * 0.3) * 0.8;
            const drift = Math.cos(time * 0.4 + ox * 0.3) * 0.3;

            im.getMatrixAt(i, mat4tmp);
            mat4tmp.decompose(dummy.position, dummy.quaternion, dummy.scale);
            dummy.position.set(
                ox + drift + data.offsets[i * 3],
                oy + bob + data.offsets[i * 3 + 1],
                oz + data.offsets[i * 3 + 2]
            );
            dummy.rotation.set(time * 0.3 + i, time * 0.2 + i * 0.5, 0);
            dummy.scale.setScalar(0.4 + Math.sin(time + i) * 0.15);
            dummy.updateMatrix();
            im.setMatrixAt(i, dummy.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
    });
}


// === MOUSE REPULSION INTERACTION ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(9999, 9999);
const repulsionRadius = 8.0;
const repulsionStrength = 14.0;
const returnSpeed = 2.5;
let lastMouseMoveTime = 0;
const mouseIdleTimeout = 0.08;
let mouseActive = false;
const _smoothHitPoint = new THREE.Vector3(9999, 9999, 9999);
let _hasSmoothedHit = false;
const hitSmoothSpeed = 12.0;

const _bboxCenter = new THREE.Vector3();
_islandBBox.getCenter(_bboxCenter);
const _rayPlane = new THREE.Plane();
const _planeIntersect = new THREE.Vector3();

window.addEventListener('mousemove', (e) => {
    const rect = sceneContainer.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    lastMouseMoveTime = performance.now();
    mouseActive = true;
});

window.addEventListener('mouseleave', () => {
    mouse.x = 9999;
    mouse.y = 9999;
    mouseActive = false;
});

const _hitPoint = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _mat4 = new THREE.Matrix4();
let hasHit = false;

function updateRepulsion(dt) {
    const now = performance.now();
    const mouseIdle = (now - lastMouseMoveTime) / 1000 > mouseIdleTimeout;

    raycaster.setFromCamera(mouse, camera);
    const camDir = raycaster.ray.direction;
    _rayPlane.setFromNormalAndCoplanarPoint(camDir.clone().negate(), _bboxCenter);
    const rawHit = raycaster.ray.intersectPlane(_rayPlane, _planeIntersect) !== null;
    const distToCenter = _planeIntersect.distanceTo(_bboxCenter);
    const maxProxyDist = Math.max(_islandBBox.getSize(new THREE.Vector3()).length() * 0.55, 15);
    const validHit = rawHit && distToCenter < maxProxyDist;

    if (validHit) {
        _hitPoint.copy(_planeIntersect);
        if (!_hasSmoothedHit) {
            _smoothHitPoint.copy(_hitPoint);
            _hasSmoothedHit = true;
        } else if (!mouseIdle) {
            const smoothFactor = 1.0 - Math.exp(-hitSmoothSpeed * Math.min(dt, 0.05));
            _smoothHitPoint.lerp(_hitPoint, smoothFactor);
        }
    } else {
        _hasSmoothedHit = false;
    }
    hasHit = validHit;

    const dtClamped = Math.min(dt, 0.05);

    voxels.forEach(im => {
        if (im.name.startsWith('cat_particle')) return; // particles handle their own animation
        const data = instanceData.get(im);
        if (!data) return;
        const { origPositions, offsets, randDirs, count } = data;
        let needsUpdate = false;

        for (let i = 0; i < count; i++) {
            const ox = origPositions[i * 3];
            const oy = origPositions[i * 3 + 1];
            const oz = origPositions[i * 3 + 2];

            let targetOffX = 0, targetOffY = 0, targetOffZ = 0;

            if (hasHit) {
                _dir.set(ox - _smoothHitPoint.x, oy - _smoothHitPoint.y, oz - _smoothHitPoint.z);
                const dist = _dir.length();

                if (dist < repulsionRadius && dist > 0.01) {
                    const falloff = 1.0 - (dist / repulsionRadius);
                    const strength = falloff * falloff * falloff * repulsionStrength;
                    _dir.normalize();

                    const pulsePhase = (ox * 1.3 + oy * 0.7 + oz * 1.1);
                    const pulseTime = performance.now();
                    const pulseAmount = Math.sin(pulseTime * 0.003 + pulsePhase) * 0.15;
                    const breathScale = 1.0 + pulseAmount * falloff;

                    const rx = randDirs[i * 3];
                    const ry = randDirs[i * 3 + 1];
                    const rz = randDirs[i * 3 + 2];
                    const radialMix = 0.6;
                    const mx = _dir.x * radialMix + rx * (1.0 - radialMix);
                    const my = _dir.y * radialMix + ry * (1.0 - radialMix);
                    const mz = _dir.z * radialMix + rz * (1.0 - radialMix);
                    const ml = Math.sqrt(mx * mx + my * my + mz * mz) || 1;

                    targetOffX = (mx / ml) * strength * breathScale;
                    targetOffY = (my / ml) * strength * breathScale;
                    targetOffZ = (mz / ml) * strength * breathScale;
                }
            }

            const activeSpeed = hasHit ? 8.0 : returnSpeed;
            const lerpFactor = 1.0 - Math.exp(-activeSpeed * dtClamped);
            const curX = offsets[i * 3];
            const curY = offsets[i * 3 + 1];
            const curZ = offsets[i * 3 + 2];

            const newX = curX + (targetOffX - curX) * lerpFactor;
            const newY = curY + (targetOffY - curY) * lerpFactor;
            const newZ = curZ + (targetOffZ - curZ) * lerpFactor;

            if (Math.abs(newX - curX) > 0.0001 || Math.abs(newY - curY) > 0.0001 || Math.abs(newZ - curZ) > 0.0001) {
                offsets[i * 3] = newX;
                offsets[i * 3 + 1] = newY;
                offsets[i * 3 + 2] = newZ;

                im.getMatrixAt(i, _mat4);
                _mat4.decompose(_dummy.position, _dummy.quaternion, _dummy.scale);
                _dummy.position.set(ox + newX, oy + newY, oz + newZ);
                _dummy.updateMatrix();
                im.setMatrixAt(i, _dummy.matrix);
                needsUpdate = true;
            } else if (Math.abs(curX) > 0.0001 || Math.abs(curY) > 0.0001 || Math.abs(curZ) > 0.0001) {
                offsets[i * 3] = newX;
                offsets[i * 3 + 1] = newY;
                offsets[i * 3 + 2] = newZ;

                im.getMatrixAt(i, _mat4);
                _mat4.decompose(_dummy.position, _dummy.quaternion, _dummy.scale);
                _dummy.position.set(ox + newX, oy + newY, oz + newZ);
                _dummy.updateMatrix();
                im.setMatrixAt(i, _dummy.matrix);
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            im.instanceMatrix.needsUpdate = true;
        }
    });
}

const voxelMat = voxelMats[0];

// Lighting — dramatic for a security-themed lock
// Bright sky-themed lighting
const ambientLight = new THREE.AmbientLight(0x88bbff, 0.8);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
mainLight.name = 'mainLight';
mainLight.position.set(6, 18, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 40;
mainLight.shadow.camera.left = -20;
mainLight.shadow.camera.right = 20;
mainLight.shadow.camera.top = 25;
mainLight.shadow.camera.bottom = -10;
mainLight.shadow.bias = 0.0001;
mainLight.shadow.normalBias = 0.05;
mainLight.shadow.radius = 5.0;
mainLight.shadow.blurSamples = 16;
scene.add(mainLight);

const softShadowLight = new THREE.DirectionalLight(0xfff8e8, 0.6);
softShadowLight.name = 'softShadowLight';
softShadowLight.position.set(-3, 8, 6);
softShadowLight.castShadow = true;
softShadowLight.shadow.mapSize.width = 512;
softShadowLight.shadow.mapSize.height = 512;
softShadowLight.shadow.camera.near = 0.5;
softShadowLight.shadow.camera.far = 30;
softShadowLight.shadow.camera.left = -18;
softShadowLight.shadow.camera.right = 18;
softShadowLight.shadow.camera.top = 22;
softShadowLight.shadow.camera.bottom = -8;
softShadowLight.shadow.bias = 0.0001;
softShadowLight.shadow.normalBias = 0.05;
softShadowLight.shadow.radius = 3.75;
softShadowLight.shadow.blurSamples = 16;
scene.add(softShadowLight);

// Sky-blue fill light
const fillLight = new THREE.DirectionalLight(0x88bbee, 1.0);
fillLight.name = 'fillLight';
fillLight.position.set(-5, 10, -3);
scene.add(fillLight);

// Cyan rim light to match lock
const rimLight = new THREE.PointLight(0x00bcd4, 2.0, 30);
rimLight.name = 'rimLight';
rimLight.position.set(-4, 12, -5);
scene.add(rimLight);

// Warm orange accent light
const accentLight = new THREE.PointLight(0xff9800, 1.5, 25);
accentLight.name = 'accentLight';
accentLight.position.set(4, 10, 4);
scene.add(accentLight);

// Soft cyan underlight
const underLight = new THREE.PointLight(0x00bcd4, 1.0, 20);
underLight.name = 'underLight';
underLight.position.set(0, -5, 3);
scene.add(underLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Post-processing
let postProcessing = null;
let aoPass = null;
let ssrPass = null;
let bloomPass = null;

try {
    postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    scenePass.setMRT(mrt({
        output: output,
        normal: normalView,
        metalness: metalness,
        roughness: roughness
    }));

    const scenePassColor = scenePass.getTextureNode('output');
    const scenePassNormal = scenePass.getTextureNode('normal');
    const scenePassDepth = scenePass.getTextureNode('depth');
    const scenePassMetalness = scenePass.getTextureNode('metalness');
    const scenePassRoughness = scenePass.getTextureNode('roughness');

    let currentOutput = scenePassColor;

    if (ao) {
        try {
            aoPass = ao(scenePassDepth, scenePassNormal, camera);
            aoPass.resolutionScale = 1.0;
            aoPass.samples.value = 16;
            aoPass.radius.value = 0.60;
            aoPass.distanceExponent.value = 1.0;
            aoPass.thickness.value = 1.60;
            const aoTexture = aoPass.getTextureNode();
            if (denoise) {
                try {
                    const denoisePass = denoise(aoTexture, scenePassDepth, scenePassNormal, camera);
                    denoisePass.sigma.value = 30.0;
                    denoisePass.kSigma.value = 5.0;
                    denoisePass.threshold.value = 0.05;
                    currentOutput = vec3(currentOutput.rgb.mul(denoisePass.r)).toVec4(currentOutput.a);
                } catch (de) {
                    currentOutput = vec3(currentOutput.rgb.mul(aoTexture.r)).toVec4(currentOutput.a);
                }
            } else {
                currentOutput = vec3(currentOutput.rgb.mul(aoTexture.r)).toVec4(currentOutput.a);
            }
        } catch (e) { console.warn('GTAO failed:', e); }
    }

    if (ssrModule && ssrModule.ssr) {
        try {
            ssrPass = ssrModule.ssr(scenePassColor, scenePassDepth, scenePassNormal, scenePassMetalness, scenePassRoughness, camera);
            ssrPass.resolutionScale = 0.25;
            ssrPass.thickness.value = 0.2;
            ssrPass.maxDistance.value = 4.0;
            ssrPass.samples = 4;
            const ssrTexture = ssrPass.getTextureNode();
            const ssrStrengthUniform = uniform(0.25);
            window._ssrStrength = ssrStrengthUniform;
            currentOutput = vec3(currentOutput.rgb.add(ssrTexture.rgb.mul(ssrStrengthUniform))).toVec4(currentOutput.a);
        } catch (e) { console.warn('SSR failed:', e); }
    }

    const bloomFn = bloomModule && bloomModule.bloom;
    if (bloomFn) {
        try {
            bloomPass = bloomFn(currentOutput, 0.6, 0.3, 0.7);
            currentOutput = currentOutput.add(bloomPass);
        } catch (e) { console.warn('Bloom failed:', e); }
    }

    postProcessing.outputNode = currentOutput;
} catch (e) {
    console.warn('Post-processing failed:', e);
    postProcessing = null;
}

// Adaptive quality
let lastAdaptiveDist = -1;
function updateAdaptiveQuality() {
    const dist = camera.position.length();
    if (Math.abs(dist - lastAdaptiveDist) < 0.15) return;
    lastAdaptiveDist = dist;
    const t = Math.min(Math.max((dist - 3) / 5, 0), 1);
    const s = t * t * (3 - 2 * t);
    if (aoPass) {
        aoPass.samples.value = Math.round(4 + 12 * s);
        aoPass.radius.value = 0.60 * (1 + (1 - s) * 0.3);
        aoPass.resolutionScale = 0.75 + 0.25 * s;
    }
    if (ssrPass) ssrPass.resolutionScale = 0.15 + 0.10 * s;
    const maxDPR = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(Math.max(1, maxDPR * (0.75 + 0.25 * s)));
}

// FPS counter
const fpsEl = document.getElementById('fps-counter');
let frameCount = 0;
let lastFpsTime = performance.now();

// Gentle floating animation for the entire lock
let lockFloatTime = 0;

// Animation
let lastTime = performance.now();

function animate() {
    const now2 = performance.now();
    const dt = (now2 - lastTime) / 1000;
    lastTime = now2;
    lockFloatTime += dt;

    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
        const fps = Math.round(frameCount / ((now - lastFpsTime) / 1000));
        if (fpsEl) fpsEl.textContent = fps + ' FPS';
        frameCount = 0;
        lastFpsTime = now;
    }

    controls.update();
    updateAdaptiveQuality();
    updateRepulsion(dt);
    updateParticles(dt);

    if (postProcessing) {
        postProcessing.render();
    } else {
        renderer.render(scene, camera);
    }
}
renderer.setAnimationLoop(animate);

// Resize
window.addEventListener('resize', () => {
    camera.aspect = containerW() / containerH();
    camera.updateProjectionMatrix();
    applyViewOffset();
    renderer.setSize(containerW(), containerH());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    lastAdaptiveDist = -1;
});

// === UI Bindings (kept for compatibility with hidden panel) ===
function bindRange(id, valId, callback) {
    const input = document.getElementById(id);
    const display = document.getElementById(valId);
    if (!input) return;
    input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        if (display) display.textContent = v.toFixed(2);
        callback(v);
    });
}

function applyToAllMats(fn) {
    voxelMats.forEach(fn);
}

bindRange('mat-roughness', 'val-roughness', (v) => { applyToAllMats(m => { m.roughness = v; }); });
bindRange('mat-metalness', 'val-metalness', (v) => { applyToAllMats(m => { m.metalness = v; }); });
bindRange('scene-blur', 'val-blur', (v) => { scene.backgroundBlurriness = v; });
bindRange('scene-bg-int', 'val-bg-int', (v) => { scene.backgroundIntensity = v; });
bindRange('scene-exposure', 'val-exposure', (v) => { renderer.toneMappingExposure = v; });

const envSelect = document.getElementById('env-select');
if (envSelect) {
    envSelect.addEventListener('change', () => {
        const name = envSelect.value;
        const url = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${name}.hdr`;
        rgbeLoader.load(url, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            if (scene.environment) scene.environment.dispose();
            if (scene.background && scene.background.isTexture) scene.background.dispose();
            scene.environment = texture;
            scene.background = texture;
        });
    });
}