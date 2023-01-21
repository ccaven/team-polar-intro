
import * as THREE from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import {
    createAndSetupCanvas
} from './utils.js';

/*
import {
    MeshLine,
    MeshLineMaterial,
    MeshLineRaycast
} from './three/THREE.MeshLine.js';
*/

const canvas = createAndSetupCanvas(600, 600);

const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setClearColor(new THREE.Color(1.0, 0.2, 0.45));
renderer.clear();

const scene = new THREE.Scene();


const vertexShader = `
uniform float time;

void main() {

  // transform!
  vec3 transformedPosition = position.xyz + max(0.0, cos(time * 0.1)) * 100.0 * vec3(
    cos(position.z * 0.1 + time),
    sin(position.z * 0.1 + time),
    0.0
  );

  gl_PointSize = 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);

}`;
const fragmentShader = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 0.2, 1.0);
}
`;

const material = new THREE.ShaderMaterial({

  uniforms: {
    time: { value: 0.0 },
  },

  vertexShader, fragmentShader

});

const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load("./res/polar_bear_points_3.glb", gltf => {

  console.log(gltf);
  
  const points = gltf.scene.children[0];

  points.material = material;

  scene.add(points);

  /* do stuff */

});



const camera = new THREE.PerspectiveCamera(75, 1.0, 1.0, 1000.0);
camera.translateZ(-150.0);
camera.translateY(100.0);
camera.lookAt(0, 0, 0);


const controls = new OrbitControls(camera, canvas);

function render(time) {
  renderer.render(scene, camera);

  controls.update();


  material.uniforms["time"].value += 0.05;
  material.uniformsNeedUpdate = true;

  requestAnimationFrame(render);
}

requestAnimationFrame(render);


/*
const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1.0);
light.translateZ(-10.0);
light.translateY(10.0);
light.translateX(-1.0);
light.lookAt(0, 0, 0);

scene.add(light)

const camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 100.0);
camera.translateZ(-4.0);
camera.lookAt(0, 0, 0);

const loader = new GLTFLoader();

loader.load("./res/etch-a-sketch.glb", gltf => {

  console.log(gltf);

  
  const etchASketch = gltf.scene;

  etchASketch.rotateY(Math.PI / 2);
  etchASketch.translateX(2.5);
  etchASketch.translateY(-2.5);
  etchASketch.translateZ(-1.35);

  const mat = gltf.scene.children[0].children[1].material;

  mat.color = new THREE.Color(1.0, 1.0, 1.0);

  etchASketch.children[0].children[3].material.color = new THREE.Color(1.0, 0.0, 1.0);

  scene.add(gltf.scene);

});

function render(time) {
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
*/