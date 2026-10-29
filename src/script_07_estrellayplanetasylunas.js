import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let info;
let grid;
let estrella,
  Planetas = [],
  Lunas = [];
let t0 = 0;
let accglobal = 0.001;
let timestamp;

const factor_escala = 1.2;

init();
animationLoop();

function init() {
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "Práctica 6-7: Juan Francisco Almeida Santana (g42)";
  document.body.appendChild(info);

  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 300, 300);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //Se activan las sombras
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // por defecto THREE.PCFShadowMap
  document.body.appendChild( renderer.domElement );

  document.body.appendChild(renderer.domElement);

  let camcontrols = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  //grid.geometry.rotateX(Math.PI / 2);
  //grid.position.set(0, 0, 0.05);
  scene.add(grid);

  const TIME_SCALE = 30; // 1 s real = 30 s de juego

  Estrella(20, 0xffaa00);

  Planeta(0.001, 50, 0.0212 * TIME_SCALE, 0xffffff, 1, 1); // Centro de los Gemelos
  Planetas[0].material.visible = false;

  Planeta(3.5, 80,  0.0105 * TIME_SCALE, 0x3f8f5a, 1, 1); // Lumbre
  Planeta(3.5, 110, 0.0065 * TIME_SCALE, 0x8a6d5a, 1, 1); // Hondonada Frágil
  Planeta(5,   160, 0.0037 * TIME_SCALE, 0x2e8b57, 1, 1); // Abismo del Gigalnte
  Planeta(8, 200, 0.00266 * TIME_SCALE, 0x1e4d2b, 1, 1); // Espinoscuro
  
  Luna(Planetas[0], 3, 4,  0.052 * TIME_SCALE, 0xc2b280, 0, 0);       // Gemelo Brasa
  Luna(Planetas[0], 3, 4,  0.052 * TIME_SCALE, 0xc2b280, 0, Math.PI); // Gemelo Ceniza

  Luna(Planetas[1], 2, 10, 0.070 * TIME_SCALE, 0x9e9e9e, 0);   // Rocaterra
  Luna(Planetas[2], 1, 9, 0.06 * TIME_SCALE, 0x8b4a2b, 0); // Farol de Hondonada

  crearFuenteDeLuz(Lunas[3], {
    color: 0xffaa00,
    intensidad: 2,
    distancia: 30,
    decay: 2,
    sombras: false,
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.05));

  //Inicio tiempo
  t0 = Date.now();
}

function Estrella(rad, col) {
  let geometry = new THREE.SphereGeometry(rad, 50, 50);
  let material = new THREE.MeshBasicMaterial({ color: col });
  estrella = new THREE.Mesh(geometry, material);

  crearFuenteDeLuz(estrella, {
    color: col,
    intensidad: 4,
  });

  scene.add(estrella);
}

function Planeta(radio, dist, vel, col, f1, f2) {
  let geom = new THREE.SphereBufferGeometry(radio * factor_escala, 50, 50);
  let mat = new THREE.MeshPhongMaterial({ color: col });
  let planeta = new THREE.Mesh(geom, mat);

  planeta.castShadow = true;
  planeta.receiveShadow = true;

  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;

  Planetas.push(planeta);
  scene.add(planeta);

  //Dibuja trayectoria, con
  let curve = new THREE.EllipseCurve(
    0,
    0,
    dist * f1,
    dist * f2
  );
  //Crea geometría
  let points = curve.getPoints(50);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });
  // Objeto
  let orbita = new THREE.Line(geome, mate);
  orbita.rotation.x = -Math.PI / 2;
  scene.add(orbita);
}

function Luna(planeta, radio, dist, vel, col, angle, fase = 0) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle; //si no nulo, rotación suera de plano
  planeta.add(pivote);
  var geom = new THREE.SphereBufferGeometry(radio, 30, 30);
  var mat = new THREE.MeshPhongMaterial({ color: col });
  var luna = new THREE.Mesh(geom, mat);

  luna.castShadow = true;
  luna.receiveShadow = true;

  luna.userData.dist = dist;
  luna.userData.speed = vel;
  luna.userData.fase = fase;

  Lunas.push(luna);
  pivote.add(luna);
}

function crearFuenteDeLuz(cuerpo, {
  color = 0xffffff,
  intensidad = 1,
  distancia = 0,
  decay = 2,
  sombras = true,
} = {}) {
  const luz = new THREE.PointLight(color, intensidad, distancia, decay);
  luz.position.set(0, 0, 0);
  luz.castShadow = sombras;

  if (sombras) {
    luz.shadow.mapSize.set(2048, 2048);
    luz.shadow.camera.near = 1;
    luz.shadow.camera.far = 300;
    luz.shadow.bias = -0.0005;
  }

  cuerpo.add(luz);

  const mat = cuerpo.material;
  if (mat) {
    if (mat.emissive) {
      mat.emissive.set(color);
      mat.emissiveIntensity = 1;
    } else {
      mat.color.set(color);
    }
  }

  if (sombras) cuerpo.castShadow = false;
  return luz;
}

//Bucle de animación
function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;

  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of Planetas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed) *
      object.userData.f1 *
      object.userData.dist;

    object.position.z =
      Math.sin(timestamp * object.userData.speed) *
      object.userData.f2 *
      object.userData.dist;
  }

  for (let object of Lunas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed + object.userData.fase) * object.userData.dist;
    object.position.z =
      Math.sin(timestamp * object.userData.speed + object.userData.fase) * object.userData.dist;
  }

  renderer.render(scene, camera);
}
