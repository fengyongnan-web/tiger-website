import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.2;
bloomPass.radius = 0.8;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0x2266ff, 1);
dirLight1.position.set(1, 1, 1);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xaa44ff, 0.8);
dirLight2.position.set(-1, 0.5, -1);
scene.add(dirLight2);

const pointLight1 = new THREE.PointLight(0x00aaff, 1, 20);
pointLight1.position.set(2, 3, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff44aa, 0.8, 20);
pointLight2.position.set(-3, -1, 2);
scene.add(pointLight2);

const sphereGeometry = new THREE.SphereGeometry(1.2, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2b5c,
    emissive: 0x112266,
    roughness: 0.2,
    metalness: 0.8,
    emissiveIntensity: 1.2
});
const centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(centerSphere);

const innerSphereGeo = new THREE.SphereGeometry(0.6, 32, 32);
const innerSphereMat = new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    transparent: true,
    opacity: 0.4
});
const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
centerSphere.add(innerSphere);

const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 32, 100);
const ringMat = new THREE.MeshStandardMaterial({
    color: 0x2266ff,
    emissive: 0x2266ff,
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.7
});
const ring1 = new THREE.Mesh(ringGeo, ringMat);
ring1.rotation.x = Math.PI / 2;
ring1.rotation.z = 0.3;
scene.add(ring1);

const ring2 = new THREE.Mesh(ringGeo, ringMat);
ring2.scale.set(1.3, 1.3, 1.3);
ring2.rotation.x = Math.PI / 3;
ring2.rotation.y = 0.5;
ring2.material = ringMat.clone();
ring2.material.color.setHex(0xaa44ff);
ring2.material.emissive.setHex(0xaa44ff);
scene.add(ring2);

const ring3 = new THREE.Mesh(ringGeo, ringMat);
ring3.scale.set(0.8, 0.8, 0.8);
ring3.rotation.y = 0.8;
ring3.rotation.x = 1.2;
ring3.material = ringMat.clone();
ring3.material.color.setHex(0x00ccff);
ring3.material.emissive.setHex(0x00ccff);
scene.add(ring3);

const particlesCount = 2000;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
    const radius = 4 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    const z = radius * Math.cos(phi);

    const randomOffset = 1.5;
    posArray[i * 3] = x + (Math.random() - 0.5) * randomOffset;
    posArray[i * 3 + 1] = y + (Math.random() - 0.5) * randomOffset;
    posArray[i * 3 + 2] = z + (Math.random() - 0.5) * randomOffset;

    const colorChoice = Math.random();
    let r, g, b;
    if (colorChoice < 0.5) {
        r = 0.2 + Math.random() * 0.2;
        g = 0.5 + Math.random() * 0.4;
        b = 1.0;
    } else if (colorChoice < 0.8) {
        r = 0.2;
        g = 0.9 + Math.random() * 0.1;
        b = 1.0;
    } else {
        r = 0.7 + Math.random() * 0.3;
        g = 0.3 + Math.random() * 0.2;
        b = 1.0;
    }

    colorArray[i * 3] = r;
    colorArray[i * 3 + 1] = g;
    colorArray[i * 3 + 2] = b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const createParticleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(200,230,255,0.8)');
    gradient.addColorStop(1, 'rgba(100,150,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
};

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: createParticleTexture(),
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const lineParticlesCount = 800;
const lineParticlesGeo = new THREE.BufferGeometry();
const linePositions = new Float32Array(lineParticlesCount * 3);
const lineColors = new Float32Array(lineParticlesCount * 3);

for (let i = 0; i < lineParticlesCount; i++) {
    const ringIndex = Math.floor(i / 200);
    const t = (i % 200) / 200 * Math.PI * 2;

    let radius, yOffset, colorR, colorG, colorB;

    if (ringIndex === 0) {
        radius = 2.5;
        yOffset = 0;
        colorR = 0.2; colorG = 0.8; colorB = 1.0;
    } else if (ringIndex === 1) {
        radius = 3.2;
        yOffset = Math.sin(t * 3) * 0.5;
        colorR = 0.8; colorG = 0.3; colorB = 1.0;
    } else if (ringIndex === 2) {
        radius = 4.0;
        yOffset = Math.cos(t * 2) * 0.8;
        colorR = 0.0; colorG = 0.9; colorB = 0.8;
    } else {
        radius = 1.8;
        yOffset = Math.sin(t * 4) * 0.3;
        colorR = 0.3; colorG = 0.5; colorB = 1.0;
    }

    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = yOffset;

    linePositions[i * 3] = x;
    linePositions[i * 3 + 1] = y;
    linePositions[i * 3 + 2] = z;

    lineColors[i * 3] = colorR;
    lineColors[i * 3 + 1] = colorG;
    lineColors[i * 3 + 2] = colorB;
}

lineParticlesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineParticlesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

const lineParticlesMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const lineParticles = new THREE.Points(lineParticlesGeo, lineParticlesMat);
scene.add(lineParticles);

const extraParticlesGeo = new THREE.BufferGeometry();
const extraCount = 600;
const extraPositions = new Float32Array(extraCount * 3);
const extraColors = new Float32Array(extraCount * 3);

for (let i = 0; i < extraCount; i++) {
    const r = 6 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    const z = r * Math.cos(phi);

    extraPositions[i * 3] = x;
    extraPositions[i * 3 + 1] = y;
    extraPositions[i * 3 + 2] = z;

    const choice = Math.random();
    if (choice < 0.6) {
        extraColors[i * 3] = 0.3;
        extraColors[i * 3 + 1] = 0.6;
        extraColors[i * 3 + 2] = 1.0;
    } else {
        extraColors[i * 3] = 0.7;
        extraColors[i * 3 + 1] = 0.4;
        extraColors[i * 3 + 2] = 1.0;
    }
}

extraParticlesGeo.setAttribute('position', new THREE.BufferAttribute(extraPositions, 3));
extraParticlesGeo.setAttribute('color', new THREE.BufferAttribute(extraColors, 3));

const extraParticlesMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const extraParticles = new THREE.Points(extraParticlesGeo, extraParticlesMat);
scene.add(extraParticles);

let time = 0;

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    time += 0.002;

    const radius = 14;
    const angle = time * 0.1;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = 3 + Math.sin(time * 0.5) * 0.5;
    camera.lookAt(0, 0, 0);

    centerSphere.rotation.y += 0.001;
    centerSphere.rotation.x += 0.0005;

    ring1.rotation.z += 0.002;
    ring1.rotation.x += 0.001;
    ring2.rotation.y += 0.003;
    ring2.rotation.x += 0.001;
    ring3.rotation.x += 0.002;
    ring3.rotation.z += 0.001;

    particlesMesh.rotation.y += 0.0002;
    particlesMesh.rotation.x += 0.0001;
    lineParticles.rotation.y += 0.0005;
    lineParticles.rotation.x += 0.0002;
    extraParticles.rotation.y -= 0.0003;
    extraParticles.rotation.x += 0.0001;

    composer.render();
}

animate();
