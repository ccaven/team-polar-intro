
import * as THREE from './three/src/Three.js';

import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "./three/examples/jsm/loaders/DRACOLoader.js";

import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";

import { GUI } from "./three/examples/jsm/libs/lil-gui.module.min.js";

import {
    createAndSetupCanvas,
    smoothstep
} from './utils.js';
import { lerp } from './three/src/math/MathUtils.js';

const canvas = createAndSetupCanvas(600, 600);

const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setClearColor(new THREE.Color(0.0, 0.1, 0.25));
renderer.clear();

const scene = new THREE.Scene();

const vertexShader = /* glsl */`
#define ROT2D(theta) mat2(cos(theta), -sin(theta), cos(theta), sin(theta))

uniform float time;

vec3 calculateDisplacement (vec3 pos) {

  vec3 startPoint = 1000.0 * normalize(pos + 100.0 * cos(pos * 534.86));

  float k = max(sin(time * 0.1 - pos.x * 0.002), 0.0);

  return (startPoint - pos) * k;
}

void main() {

  // transform!
  vec3 transformedPosition = position.xyz + calculateDisplacement(position.xyz);

  vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);

  gl_PointSize = 3.0 * ( 150.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

}`;
const fragmentShader = /* glsl */`

uniform sampler2D pointTexture;

vec3 pointColor = 1.0 * vec3(1.0, 1.0, 1.0);

void main() {

  float transparency = texture2D(pointTexture, gl_PointCoord).a;

  vec4 color = vec4( pointColor, 0.05 * transparency );

  gl_FragColor = color;
}
`;

const texture = new THREE.TextureLoader().load( './res/disc.png' );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;


const material = new THREE.ShaderMaterial({

  uniforms: {
    time: { value: 1.914 },
    pointTexture: { value: texture }
  },

  vertexShader, fragmentShader,

  transparent: true,

  face: THREE.DoubleSide,
  blendEquation: THREE.AdditiveBlending,
  depthFunc: THREE.AlwaysDepth
});


const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load("./res/polar_bear_points_remesh.glb", gltf => {

  console.log(gltf);
  
  const points = gltf.scene.children[0];

  points.material = material;

  points.translateY(-25);

  console.log(points);

  scene.add(points);

  /* do stuff */

});

const camera = new THREE.PerspectiveCamera(75, 1.0, 1.0, 5000.0);
camera.translateZ(0.0);
camera.translateY(0.0);
camera.translateX(-200);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, canvas);

const gui = new GUI();
const guiParams = {
  speed: 0.0
};

gui.add(guiParams, "speed", -1.0, 1.0);

function controlAnimation(animTime) {

  const segmentLengths = [
    10, 10, 10
  ];

  let segmentIndex = 0;
  let segmentTime = animTime;
  while (segmentTime > segmentLengths[segmentIndex] && segmentIndex < segmentLengths.length - 1) {
    segmentTime -= segmentLengths[segmentIndex];
    segmentIndex += 1;
  }

  const segmentFunctions = [

    function (t) {

      t = smoothstep(t);

      const startTime = 1.914;
      const endTime = 0.0;
      material.uniforms["time"].value = lerp(
        startTime,
        endTime,
        t
      );

    },

    function (t) {

    },

    function (t) {

    }

  ];

  segmentFunctions[segmentIndex](segmentTime / segmentLengths[segmentIndex]);
}

let then = 0;
let animTime = 0;
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  requestAnimationFrame(render);

  controlAnimation(animTime);

  renderer.render(scene, camera);
  
  controls.update();

  
  animTime += deltaTime;

  //material.uniforms["time"].value += guiParams.speed * deltaTime;
  //material.uniformsNeedUpdate = true;
  
}

requestAnimationFrame(render);