import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { on } from "../core/events.js";

let classroomModel = null;

on("action:received", (action) => {
  console.log("ACTION:", action);

  // Example: lights
  if (action.target === "light") {
    const name = `light${action.id}_1`;
    const obj = scene.getObjectByName(name);
    if (!obj) return;

    obj.material = obj.material.clone();
    if (action.command === "on") obj.material.color.set(0xffffaa);
    if (action.command === "off") obj.material.color.set(0x222222);
  }

  // Example: door
  if (action.target === "door") {
    const openRot = Math.PI / 2;
    const closeRot = 0;
  
    const rot = action.command === "open" ? openRot : closeRot;
  
    doorAnim.door1.targetY = rot;
    doorAnim.door2.targetY = rot;
  }

    // Curtain
  if (action.target === "curtain") {
    if (!curtainAnim.obj) return;

    if (action.command === "open") {
      curtainAnim.targetX = curtainAnim.openX;
    } else if (action.command === "close") {
      curtainAnim.targetX = curtainAnim.closeX;
    }
  }
});

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x777777);
let renderer_div = document.querySelector('.convasCotainer');

// ---- simple door animation state ----
const doorAnim = {
  door1: { obj: null, targetY: 0 },
  door2: { obj: null, targetY: 0 },
};

// smoothing factor: 0.08–0.2 (bigger = faster)
const DOOR_SMOOTH = 0.12;

function animateDoor(doorState) {
  if (!doorState.obj) return;
  doorState.obj.rotation.y = THREE.MathUtils.lerp(
    doorState.obj.rotation.y,
    doorState.targetY,
    DOOR_SMOOTH
  );
}


// ---- curtain animation state ----
// We'll animate by sliding on X. Adjust openX/closeX after you test.
const curtainAnim = {
  obj: null,
  targetX: 0,
  closeX: 0,   // will be set after model load (initial x)
  openX: 1.0,  // how far to slide when open (tune this)
};

const CURTAIN_SMOOTH = 0.10;

function animateCurtain(state) {
  if (!state.obj) return;
  state.obj.position.x = THREE.MathUtils.lerp(
    state.obj.position.x,
    state.targetX,
    CURTAIN_SMOOTH
  );
}

// ---------- CAMERA ----------

const camera = new THREE.PerspectiveCamera(
  60,
  renderer_div.offsetWidth / renderer_div.offsetHeight,
  0.1,
  100
);

camera.position.set(13, 11, -10);
camera.lookAt(0, 1, 0);




// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(renderer_div.clientWidth, renderer_div.clientHeight, false);renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // best quality/performance



// ---------- BACKGROUND IMAGE ----------
// const backgroundLoader = new THREE.TextureLoader();
// backgroundLoader.load('../../../assets/background-3d/Z.jpg' , function(texture)
//             {
//              scene.background = texture;  
//             });


// main div for containing this one 
renderer_div.appendChild(renderer.domElement);
// ---------- LIGHTS ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 5);
// Shadow quality settings (IMPORTANT)
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;

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

// lights names are light[n]_1
// for example to turn on the first light for we light1_1 and set the color


/// ---------- LOAD GLB ----------
const loader = new GLTFLoader();
loader.load(
  "3d-assets/class-room5.glb",
  (gltf) => {
    classroomModel = gltf.scene;
    scene.add(classroomModel);

    // ---- Doors: capture ONCE + initial closed pose ----
    doorAnim.door1.obj = classroomModel.getObjectByName("door_1");
    doorAnim.door2.obj = classroomModel.getObjectByName("door_2");

    if (doorAnim.door1.obj) {
      doorAnim.door1.obj.rotation.y = 0;
      doorAnim.door1.targetY = 0;
    }
    if (doorAnim.door2.obj) {
      doorAnim.door2.obj.rotation.y = 0;
      doorAnim.door2.targetY = 0;
    }

    // ---- Curtain: capture ONCE + initial closed pose ----
    curtainAnim.obj = classroomModel.getObjectByName("cur_1");

    if (curtainAnim.obj) {
      // save initial position as "closed"
      curtainAnim.closeX = curtainAnim.obj.position.x;
      curtainAnim.targetX = curtainAnim.closeX;

      // choose an "open" position relative to closed (TUNE THIS)
      curtainAnim.openX = curtainAnim.closeX + 1.2;
    }
    // ---- Shadows + debug names ----
    classroomModel.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      console.log(obj.name);
    });
  },
  undefined,
  (error) => console.error("GLB load error:", error)
);

// ---------- HDR enviroment ----------
const rgbeLoader = new RGBELoader();

rgbeLoader.load('/hdr/studio_small_08_1k.hdr', (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = hdr;
  scene.background =  new THREE.Color(0xffffff); // keep background dark (optional)
});

// ---------- RESIZE ----------
window.addEventListener('resize', () => {
  const w = renderer_div.clientWidth;
  const h = renderer_div.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h, false); // false = don't touch canvas CSS size
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const ro = new ResizeObserver(() => {
  const w = renderer_div.clientWidth;
  const h = renderer_div.clientHeight;
  if (!w || !h) return;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

ro.observe(renderer_div); 

// ---------- RENDER LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  animateDoor(doorAnim.door1);
  animateDoor(doorAnim.door2);
  animateCurtain(curtainAnim);

  controls.update();
  renderer.render(scene, camera);
  
}

animate();
