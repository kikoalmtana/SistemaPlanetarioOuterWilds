import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";

let scene, renderer;
let camera;
let info;
let estrella,
  Planetas = [],
  Lunas = [];
let t0 = 0;
let accglobal = 0.001;
let timestamp;
let camcontrols;

const factor_escala = 1.2;

let objetivo = null;
let posObjetivo = new THREE.Vector3();
let camaraInicial = null;
let targetInicial = null;

let flyControls;
let modoNave = false;
const reloj = new THREE.Clock();

function crearSelector() {
  camaraInicial = camera.position.clone();
  targetInicial = camcontrols.target.clone();

  const cuerpos = [
    { nombre: "Sol",                 obj: estrella },
    { nombre: "Gemelo Brasa",        obj: Lunas[0] },
    { nombre: "Gemelo Ceniza",       obj: Lunas[1] },
    { nombre: "Lumbre",              obj: Planetas[1] },
    { nombre: "Rocaterra",           obj: Lunas[2] },
    { nombre: "Hondonada Frágil",    obj: Planetas[2] },
    { nombre: "Farol de Hondonada",  obj: Lunas[3] },
    { nombre: "Abismo del Gigante",  obj: Planetas[3] },
    { nombre: "Nave Espacial",       nave: true },
  ];

  const select = document.createElement("select");
  select.style.cssText =
    "position:absolute;top:10px;left:10px;z-index:10;padding:6px 10px;font-size:14px;";
  cuerpos.forEach((c, i) => select.add(new Option(c.nombre, i)));

  select.addEventListener("change", () => {

    let cuerpo = cuerpos[select.value]

    if (cuerpo.nave) {
      activarNave();
    } else {
      desactivarNave();
      enfocar(cuerpo.obj);
    }

  });

  document.body.appendChild(select);
}

function enfocar(obj) {
  if (obj === estrella) {
    // Vista general original
    objetivo = null;
    camcontrols.target.copy(targetInicial);
    camera.position.copy(camaraInicial);
    camcontrols.minDistance = 0;
  } else {
    objetivo = obj;
    const radio = obj.geometry.parameters.radius;
    obj.getWorldPosition(posObjetivo);
    camcontrols.target.copy(posObjetivo);
    // Cámara cerca del cuerpo, proporcional a su tamaño
    camera.position
      .copy(posObjetivo)
      .add(new THREE.Vector3(0, radio * 1.5, radio * 4));
    camcontrols.minDistance = radio * 1.5; // evita meter la cámara dentro del cuerpo
  }
  camcontrols.update();
}

function activarNave() {
  if (modoNave) return;
  camera.lookAt(camcontrols.target); 
  objetivo = null; 
  camcontrols.enabled = false;
  flyControls.enabled = true;
  modoNave = true;
}

function desactivarNave() {
  if (!modoNave) return;
  modoNave = false;
  flyControls.enabled = false;
  camcontrols.enabled = true;
  camera.up.set(0, 1, 0); 
}

init();
crearSelector();
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

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //Se activan las sombras
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // por defecto THREE.PCFShadowMap
  document.body.appendChild( renderer.domElement );

  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);
  camcontrols.target.set(0, 0, 0);
  camcontrols.update();

  flyControls = new FlyControls(camera, renderer.domElement);
  flyControls.movementSpeed = 30; 
  flyControls.rollSpeed = 0.5; 
  flyControls.dragToLook = true;
  flyControls.autoForward = false; 
  flyControls.enabled = false;

  const TIME_SCALE = 30; // 1 s real = 30 s de juego

  const textureLoader = new THREE.TextureLoader();
  
  const sol = textureLoader.load("./assets/01_sol.jpg");
  const gemelo_brasa = textureLoader.load("./assets/02_gemelo_brasa.jpg");
  const gemelo_ceniza = textureLoader.load("./assets/03_gemelo_ceniza.jpg");
  const lumbre = textureLoader.load("./assets/04_lumbre.png");
  const rocaterra = textureLoader.load("./assets/05_rocaterra.jpg");
  const hondonada_fragil = textureLoader.load("./assets/06_hondonada_fragil.png");
  const farol_de_hondonada = textureLoader.load("./assets/07_farol_de_hondonada.jpg");
  const abismo_del_gigante = textureLoader.load("./assets/08_abismo_del_gigante.png");

  Estrella(20, 0xffaa00, sol);

  Planeta(0.001, 50, 0.0212 * TIME_SCALE, 0xffffff, 1, 1); // Centro de los Gemelos
  Planetas[0].material.visible = false;
  Planeta(3.5, 80,  0.0105 * TIME_SCALE, 0x3f8f5a, 1, 1, lumbre); // Lumbre
  Planeta(3.5, 110, 0.0065 * TIME_SCALE, 0x8a6d5a, 1, 1, hondonada_fragil); // Hondonada Frágil
  Planeta(5,   160, 0.0037 * TIME_SCALE, 0x2e8b57, 1, 1, abismo_del_gigante); // Abismo del Gigalnte

  Luna(Planetas[0], 3, 4,  0.052 * TIME_SCALE, 0xc2b280, 0, 0, gemelo_brasa); // Gemelo Brasa
  Luna(Planetas[0], 3, 4,  0.052 * TIME_SCALE, 0xc2b280, 0, Math.PI, gemelo_ceniza); // Gemelo Ceniza

  Luna(Planetas[1], 2, 10, 0.070 * TIME_SCALE, 0x9e9e9e, 0, 0, rocaterra); // Rocaterra
  Luna(Planetas[2], 1, 9, 0.06 * TIME_SCALE, 0x8b4a2b, 0, 0, farol_de_hondonada); // Farol de Hondonada


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

function Estrella(rad, col, texture) {
  let geometry = new THREE.SphereGeometry(rad, 50, 50);
  let material = new THREE.MeshBasicMaterial({
    color: texture ? 0xffffff : col,
    map: texture,
  });
  estrella = new THREE.Mesh(geometry, material);

  crearFuenteDeLuz(estrella, {
    color: col,
    intensidad: 4,
  });

  scene.add(estrella);
}

function Planeta(radio, dist, vel, col, f1, f2, texture) {
  let geom = new THREE.SphereBufferGeometry(radio * factor_escala, 50, 50);
  let mat = new THREE.MeshPhongMaterial({
    color: texture ? 0xffffff : col,
    map: texture,
  });
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

function Luna(planeta, radio, dist, vel, col, angle, fase = 0, texture) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle; //si no nulo, rotación suera de plano
  planeta.add(pivote);
  var geom = new THREE.SphereBufferGeometry(radio, 30, 30);
  var mat = new THREE.MeshPhongMaterial({
    color: texture ? 0xffffff : col,
    map: texture,
  });
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
      mat.color.set(mat.map ? 0xffffff : color);
    }
  }

  if (sombras) cuerpo.castShadow = false;
  return luz;
}

//Bucle de animación
function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  const delta = reloj.getDelta();

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


  if (modoNave) {
    flyControls.update(delta);
  } else {
    if (objetivo) {
      objetivo.getWorldPosition(posObjetivo);
      const desplazamiento = posObjetivo.clone().sub(camcontrols.target);
      camera.position.add(desplazamiento);
      camcontrols.target.copy(posObjetivo);
    }
    camcontrols.update();
  }

  renderer.render(scene, camera);
}
