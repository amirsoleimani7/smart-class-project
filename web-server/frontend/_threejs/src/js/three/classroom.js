import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
let renderer_div = document.querySelector('.convasCotainer');


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
renderer.setSize(renderer_div.offsetWidth, renderer_div.offsetHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // best quality/performance



// ---------- BACKGROUND IMAGE ----------
const backgroundLoader = new THREE.TextureLoader();
backgroundLoader.load('../../../assets/background-3d/Z.jpg' , function(texture)
            {
             scene.background = texture;  
            });


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


// ---------- LOAD GLB ----------
const loader = new GLTFLoader();
loader.load(
  "3d-assets/class-room5.glb",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
    
        console.log(obj.name);
    
        if (obj.name === "light1_1") {
          obj.material = obj.material.clone();
          obj.material.color.set(0xff0000);
        }
    
        if (obj.name === "door_1" || obj.name === "door_2") {
          obj.rotation.y = Math.PI / 2;
        }
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

rgbeLoader.load('/hdr/studio_small_08_1k.hdr', (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = hdr;
  scene.background =  new THREE.Color(0xffffff); // keep background dark (optional)
});

// ---------- RESIZE ----------
window.addEventListener('resize', () => {
  camera.aspect = renderer_div.offsetWidth / renderer_div.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(renderer_div.offsetWidth, offsetHeight);
});

// ---------- RENDER LOOP ----------
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
  
}

animate();
