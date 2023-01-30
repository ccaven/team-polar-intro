import * as THREE from "./three_module_6.js";

import { GLTFLoader } from "./GLTFLoader4.js";
import { FontLoader } from "./FontLoader3.js";
import { DRACOLoader } from "./DRACOLoader4.js";
import { TextGeometry } from "./TextGeometry3.js";
import { createAndSetupCanvas, smoothstep, getMousePos, loadFileURI } from "./utils.js";

export async function init() {

    const canvas = createAndSetupCanvas(600, 600);

    const renderer = new THREE.WebGLRenderer({ canvas });

    const scene = new THREE.Scene();

    const manager = new THREE.LoadingManager();
    //const texture = new THREE.TextureLoader(manager).load(await loadFileURI("disc.png"));
    const texture = getDotTexture(200);



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

    const dracoLoader = new DRACOLoader(manager);

    const loader = new GLTFLoader(manager);

    const camera = new THREE.PerspectiveCamera(75, 1.0, 1.0, 5000.0);

    loader.setDRACOLoader(dracoLoader);

    //const gltf = await loader.loadAsync("./res/polar_bear_points_remesh.glb");
    const gltf = await loader.loadAsync(await loadFileURI("polar_bear_points_remesh.glb"));

    console.log(gltf);

    /** @type {THREE.Points} */
    const points = gltf.scene.children[0];

    points.material = material;

    points.translateY(-25);

    const numPoints = points.geometry.getAttribute("position").count;
    const rndPoints = generateRandomPointsArray(numPoints, 1000);
    const rndPointAttribute = new THREE.BufferAttribute(rndPoints, 3, false);
    points.geometry.setAttribute("rndPoint", rndPointAttribute);


    renderer.setClearColor(new THREE.Color(0.0, 0.1, 0.25));

    const fontLoader = new FontLoader();
    const hackFont = await fontLoader.loadAsync(await loadFileURI("Hack_Regular.json"));

    const title = generateTextMesh("Team Polar", hackFont, 20);

    title.rotateY(Math.PI * 3 / 4);
    title.translateX(-215);
    title.translateY(75);
    title.translateZ(-60);

    const members = generateTextMesh("Polar\nxacer\nJSCoder\nJake K.\nEragon\nCoraL", hackFont, 10);

    members.rotateY(Math.PI * 3 / 4);
    members.translateX(-165);
    members.translateY(25);
    members.translateZ(-60);
    
    scene.add(points);
    scene.add(title);
    scene.add(members);

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

    let mx = 0, my = 0;
    canvas.onmousemove = evt => {
        const { x, y } = getMousePos(canvas, evt);
        mx = x;
        my = y;
    };

    canvas.onmousedown = _ => {
        t = 0;
    }
    
    function render(now) {

        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        requestAnimationFrame(render);

        animate(Math.min(t / 5.0, 1.0));

        camera.rotateY(+0.1 * (mx - 0.5));
        camera.rotateX(+0.1 * (my - 0.5));

        //animate(1.0);

        renderer.render(scene, camera);

        t += deltaTime;

        material.uniforms["time"].value = t;
    }

    requestAnimationFrame(render);

}

function getDotTexture(s) {

    let data = new Uint8Array(4 * s * s);

    for (let y = 0; y < s; y ++) {
        for (let x = 0; x < s; x ++) {

            let _x = x / s - 0.5;
            let _y = y / s - 0.5;
            let m = 2.0 * Math.sqrt(_x * _x + _y * _y);

            m = Math.pow(m, 1.0);

            m = Math.max(1.0 - m, 0.0);

            let l = x + y * s << 2;
            data[l + 0] = 255 * m;
            data[l + 1] = 255 * m;
            data[l + 2] = 255 * m;
            data[l + 3] = 255 * m;

        }
    }

    const imgData = new ImageData(s, s);
    imgData.data.set(data);

    const tex = new THREE.Texture(imgData);
    tex.needsUpdate = true;

    return tex;

}

function lerp(a, b, k) {
    return a + (b - a) * k;
}

function generateTextMesh(text, font, size) {

    const textGeo = new TextGeometry(text, {
        font,
        size,
        height: 1,
        curveSegments: 4,
        bevelEnabled: false
    });

    textGeo.computeBoundingBox();

    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    const mesh = new THREE.Mesh( textGeo );

    mesh.position.x = centerOffset;
    mesh.position.y = 0.0;
    mesh.position.z = 0;

    mesh.rotation.x = 0;
    mesh.rotation.y = Math.PI * 2;

    return mesh;
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