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
      if (!curtainAnim.objs.length) return;
    
      if (action.command === "open") {
        curtainAnim.targetScaleX = curtainAnim.openScaleX;
      } else if (action.command === "close") {
        curtainAnim.targetScaleX = curtainAnim.closeScaleX;
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
// Animate by scaling on X (squish open/close)
// ---- curtain animation state (multiple objects) ----
const curtainAnim = {
  objs: [],            // multiple curtain meshes/groups
  targetScaleX: 1,
  closeScaleX: 1,
  openScaleX: 0.12,    // tune 0.05..0.3
};

const CURTAIN_SMOOTH = 0.10;

let t = 0;

// tune these
const CURTAIN_SPRING = 18;   // stiffness
const CURTAIN_DAMP = 8;      // damping
const CURTAIN_WAVE = 0.015;  // wave amount

function animateCurtain(state, dt) {
  if (!state.objs.length) return;

  // spring toward targetScaleX
  state.vel ??= 0;
  const x = state.current ?? state.closeScaleX;

  const force = (state.targetScaleX - x) * CURTAIN_SPRING;
  state.vel += force * dt;
  state.vel *= Math.exp(-CURTAIN_DAMP * dt);

  state.current = x + state.vel * dt;

  // apply to all curtains
  t += dt;
  for (const obj of state.objs) {
    // base scale
    obj.scale.x = state.current;

    // tiny “cloth wave” while moving
    const moving = Math.abs(state.targetScaleX - state.current) > 0.002;
    if (moving) {
      obj.rotation.z = Math.sin(t * 6.0) * CURTAIN_WAVE;
    } else {
      // return rotation to rest smoothly
      obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, 0, 0.08);
    }
  }
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
    // collect all curtain objects that match name "cur_1"
    curtainAnim.objs = [];
    classroomModel.traverse((obj) => {
      if (obj.name === "cur_1" || obj.name === "cur_2") {
        curtainAnim.objs.push(obj);
      }
    });

    if (curtainAnim.objs.length) {
      // use the first one as reference for closed scale
      curtainAnim.closeScaleX = curtainAnim.objs[0].scale.x;
      curtainAnim.targetScaleX = curtainAnim.closeScaleX;
      curtainAnim.openScaleX = curtainAnim.closeScaleX * 0.12; // tune

      console.log("Curtains found:", curtainAnim.objs.length);
    } else {
      console.warn('No curtain objects named "cur_1" found in GLB');
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
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.033); // cap delta

  animateDoor(doorAnim.door1);
  animateDoor(doorAnim.door2);
  animateCurtain(curtainAnim, dt);

  controls.update();
  renderer.render(scene, camera);
}
animate();
