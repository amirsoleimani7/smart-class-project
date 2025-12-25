import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';



// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(13, 11, -10);
camera.lookAt(0, 1, 0);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

document.body.appendChild(renderer.domElement);

// ---------- LIGHTS ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ---------- NEW LIGHT ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
// const dirLight1 = new THREE.DirectionalLight(0xffffff, .5);
// dirLight1.position.set(5, 10, 5);
// scene.add(dirLight1);


// ---------- CONTROLS ----------
const controls = new OrbitControls(camera, renderer.domElement);

// Target = where the camera looks
controls.target.set(0, 1, 0);

// Enable features
controls.enableRotate = true;
controls.enablePan = true;
controls.enableZoom = true;

// Zoom limits (VERY IMPORTANT)
controls.minDistance = 3;
controls.maxDistance = 30;

// Vertical rotation limits (avoid going under floor)
controls.minPolarAngle = Math.PI * 0.15; // ~27°
controls.maxPolarAngle = Math.PI * 0.48; // ~86°
controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.update();





// ---------- LOAD GLB ----------
const loader = new GLTFLoader();
loader.load(
  "class-room.glb ",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    model.traverse((obj) => {
      if (obj.isMesh) {
        console.log(obj.name);
      }
    });
  },
  undefined,
  (error) => {
    console.error('GLB load error:', error);
  }
);


// ---------- HDR enviroment ----------
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/hdr/studio_small_08_1k.hdr', (envMap) => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envMap;
});

// ---------- RESIZE ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- RENDER LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
