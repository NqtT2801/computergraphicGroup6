import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loader
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
// Update Env Material
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = 5
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};
// character
let character, actionCharacter, mixerCharacter;
fbxLoader.load("models/character/character.fbx", (object) => {
  object.scale.set(0.01, 0.01, 0.01);
  object.rotation.y = Math.PI;
  character = object;
  mixerCharacter = new THREE.AnimationMixer(object);

  actionCharacter = mixerCharacter.clipAction(object.animations[0]);
  actionCharacter.play();
  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  updateAllMaterials()
  scene.add(object);
});
// Terrain
gltfLoader.load("/models/terrain/scene.gltf", (gltf) => {
  gltf.scene.scale.set(0.09, 0.09, 0.09);
  gltf.scene.position.set(0, -4, -10);
  updateAllMaterials()
  scene.add(gltf.scene);
});
// Air plane
let airplane;
gltfLoader.load("/models/airplane/scene.gltf", (gltf) => {
  airplane = gltf.scene;
  gltf.scene.scale.set(0.1, 0.1, 0.1);
  updateAllMaterials();
  scene.add(gltf.scene);
});
// Crab
let crab;
gltfLoader.load("/models/crab/scene.gltf", (gltf) => {
  crab = gltf.scene;
  gltf.scene.scale.set(1.2, 1.2, 1.2);
  gltf.scene.position.set(0, -2.9, 0);
  gltf.scene.rotation.y = Math.PI;
  updateAllMaterials();
  scene.add(gltf.scene);
});
// House
let house;
gltfLoader.load("/models/house/scene.gltf", (gltf) => {
  house = gltf.scene;
  gltf.scene.scale.set(0.9, 0.9, 0.9);
  gltf.scene.position.set(-1, 2.2, -8);
  gltf.scene.rotation.y = Math.PI / 2;
  updateAllMaterials();
  scene.add(gltf.scene);
});
// wood
let wood;
gltfLoader.load("/models/wood/scene.gltf", (gltf) => {
  wood = gltf.scene;
  gltf.scene.scale.set(3, 3, 3);
  gltf.scene.position.set(10, -23.5, -3);
  updateAllMaterials();
  scene.add(gltf.scene);
});
// Fox
let fox;
gltfLoader.load("/models/fox/glTF/Fox.gltf", (gltf) => {
  fox = gltf.scene;
  gltf.scene.scale.set(0.015, 0.015, 0.015);
  gltf.scene.position.set(6.8, -1.3, -0.75);
  updateAllMaterials();
  scene.add(gltf.scene);
});
// Environment Map
const environmentMap = cubeTextureLoader.load([
  "./textures/envMap/px.png",
  "./textures/envMap/nx.png",
  "./textures/envMap/py.png",
  "./textures/envMap/ny.png",
  "./textures/envMap/pz.png",
  "./textures/envMap/nz.png",
]);
scene.background = environmentMap;
/**
 * Lights
 */
// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 5, 5);
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 20
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.bottom = -7;

gui.add(directionalLight, "intensity").min(0).max(10).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 2;
camera.position.y = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// Character controls
const moveDistance = 0.2;
const updateCameraWhenCharacterMove = () => {
  camera.position.x = character.position.x;
  camera.position.y = character.position.y + 2.5;
  camera.position.z = character.position.z + 1;
  controls.target.x = character.position.x;
  controls.target.y = character.position.y + 2;
  controls.target.z = character.position.z + 0.25;
  controls.update();
};
window.addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      character.position.x -= moveDistance;
      console.log("left");
      updateCameraWhenCharacterMove();
      break;
    case 83:
      character.position.z += moveDistance;
      console.log("backward");
      updateCameraWhenCharacterMove();
      break;
    case 68:
      character.position.x += moveDistance;
      console.log("right");
      updateCameraWhenCharacterMove();
      break;
    case 87:
      character.position.z -= moveDistance;
      console.log("forward");
      updateCameraWhenCharacterMove();
      break;
  }
});
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update(deltaTime);
  //mixerCharacter update
  if (mixerCharacter) {
    mixerCharacter.update(deltaTime);
  }
  // Animate Airplane
  if (airplane) {
    airplane.position.x = 4 + Math.sin(elapsedTime) * 2;
    airplane.position.z = 1 + Math.cos(elapsedTime) * 2;
  }
  // Animate Crab
  if (crab) {
    crab.position.x = Math.sin(elapsedTime + 2) * 3 - 2;
  }
  // Animate Fox
  if (fox) {
    fox.rotation.y = elapsedTime;
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
