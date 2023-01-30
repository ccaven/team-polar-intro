import * as THREE from "./three/src/Three.js";

import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "./three/examples/jsm/loaders/DRACOLoader.js";
import { createAndSetupCanvas, smoothstep } from "./utils.js";
import { lerp } from "./three/src/math/MathUtils.js";

init();

function init() {

    const canvas = createAndSetupCanvas(600, 600);

    const renderer = new THREE.WebGLRenderer({ canvas });

    const scene = new THREE.Scene();

    const texture = new THREE.TextureLoader().load("./res/disc.png");

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 1.914 },
            animTime: { value: 0.0 },
            pointTexture: { value: texture },
        },

        vertexShader: getVertexShader(),
        fragmentShader: getFragmentShader(),

        transparent: true,

        face: THREE.DoubleSide,
        blendEquation: THREE.AdditiveBlending,
        depthFunc: THREE.AlwaysDepth,
    });

    const dracoLoader = new DRACOLoader();

    const loader = new GLTFLoader();

    const camera = new THREE.PerspectiveCamera(75, 1.0, 1.0, 5000.0);

    loader.setDRACOLoader(dracoLoader);
    
    loader.load("./res/polar_bear_points_remesh.glb", (gltf) => {
        console.log(gltf);

        /** @type {THREE.Points} */
        const points = gltf.scene.children[0];

        points.material = material;

        points.translateY(-25);

        const numPoints = points.geometry.getAttribute("position").count;
        const rndPoints = generateRandomPointsArray(numPoints, 1000);
        const rndPointAttribute = new THREE.BufferAttribute(rndPoints, 3, false);
        points.geometry.setAttribute("rndPoint", rndPointAttribute);

        console.log(points);

        scene.add(points);
    });

    renderer.setClearColor(new THREE.Color(0.0, 0.1, 0.25));

    document.body.onkeydown = (keyboardEvent) => {
        if (keyboardEvent.key.toString() == "p") {
            console.log(camera.position);
            console.log(camera.quaternion);
        }
    };

    let then = 0;
    let t = 0;


    function animate(t) {
        t = smoothstep(t);
    
        const startTime = 1.914;
        const endTime = 0.0;
        material.uniforms["animTime"].value = lerp(startTime, endTime, t);
    
        const cameraPositions = [
            // Starting position
            new THREE.Vector3(200, 0, 0),
    
            // Ending position
            new THREE.Vector3(137.21, 61.17, -16.68)
        ];
    
        const cameraQuaternions = [
            // Starting rotation
            new THREE.Quaternion(
                0,
                0.7071067811865476,
                0,
                0.7071067811865476
            ),
    
            // Ending rotation
            new THREE.Quaternion(
                -0.044043449956680664,
                0.8651926590903987,
                0.07721638771201698,
                0.4934971799723947
            )
        ];
    
        // Interpolate positions
        camera.setRotationFromQuaternion(cameraQuaternions[0].slerp(cameraQuaternions[1], t));
        
        const newPosition = cameraPositions[0].lerp(cameraPositions[1], t);
    
        camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    
        camera.matrixWorldNeedsUpdate = true;
    
    }

    function render(now) {

        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        requestAnimationFrame(render);

        animate(Math.min(t / 5.0, 1.0));

        renderer.render(scene, camera);

        t += deltaTime;

        material.uniforms["time"].value = t;
    }

    requestAnimationFrame(render);

}

function generateRandomPointsArray(size, range) {
    const rndPoints = new Float32Array(3 * size);

    for (let i = 0; i < size; i ++) {
        rndPoints[i * 3 + 0] = Math.random() * range * 2 - range;
        rndPoints[i * 3 + 1] = Math.random() * range * 2 - range;
        rndPoints[i * 3 + 2] = Math.random() * range * 2 - range;
    }

    return rndPoints;
}

function getVertexShader() {
    return /* glsl */ `
    uniform float time;
    uniform float animTime;

    attribute vec3 rndPoint;

    vec3 displaceA (vec3 pos, float k) {

        vec3 start = rndPoint;
        return pos + (start - pos) * k;

    }

    vec3 displaceB (vec3 pos, float k) {

        if (k == 0.0) {
            float scanline = max(cos(pos.y * 0.1 + time * 5.0) - 0.95, 0.0);
            pos.xz += normalize(pos.xz) * scanline * 10.0;
            return pos;
        }

        return pos;

    }


    void main() {
        vec3 p = position.xyz;

        float k = max(sin(animTime * 0.1 - p.x * 0.002), 0.0);

        p = displaceA(p, k);
        p = displaceB(p, k);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);

        gl_PointSize = 3.0 * ( 150.0 / -mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
    }`;
}

function getFragmentShader() {
    return /* glsl */ `
    uniform sampler2D pointTexture;
    void main() {
      float transparency = texture2D(pointTexture, gl_PointCoord).a;
      vec4 color = vec4( 1.0, 1.0, 1.0, 0.05 * transparency );
      gl_FragColor = color;
    }
    `;
}