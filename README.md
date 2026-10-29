# Juan Francisco Almeida Santana 
## ULPGC curso 2026/27 - Grado en Ingeniería Informática

Este proyecto constituye de la entrega de las prácticas 6 y 7 de la asignatura de Informática Grafica, impartida por la Escuela de Ingeniería Informática (EII) y consta de la creación de un sistema planetario mediante Three.js

En este caso, se ha optado por imitar el sistema planetario que se explora en el videojuego "Outer Wilds"

![Sistema Solar Outer Wilds](./capturas/outer_wilds_1.jpg)

### Creación del sistema solar (práctica 6)

El sistema solar donde se desarrolla Outer Wilds está formado por diferentes planetas y lunas con un gran sol en su centro:

1) Los planetas más cercanos al Sol son dos planetas "Gemelo Brasa" y "Gemelo Ceniza", dos planetas que giran entre sí y giran juntos en torno al Sol
2) El siguiente planeta es el planeta de donde procede el personaje principal, "Lumbre", que cuenta con una luna, "Rocaterra"
3) El siguiente planeta es un planeta llamado "Hondonada Frágil", al rededor del cual gira una muy pequeña estrella llamada "Farol de Hondonada"
4) El 5 planeta de este sistema planetario es un grán planeta gaseoso llamado "Abismo del Gigante"
5) El último planeta del sistema solar es llamado "Espinoscuro"

Nota: En el videojuego existen otros cuerpos y elementos que forman parte del sistema solar (existe un agujero blanco un poco más alla de Espinoscuro y hay un cometa que gira alrededor del sol con una órbita muy excéntrica llamado "El Intruso") pero se han obviado en esta representación

Para la realización de esta tarea se han utilizado las funciones y elementos proporcionados en el script 7 del guión de la práctica 6, salvo por unas ligeras modificaciónes en las funciones Luna() y animationLoop(), en la que se añade el parámetro de fase a la función para poder controlar la posición en la que empieza la luna a orbitar a su planeta

```js
function Luna(planeta, radio, dist, vel, col, angle, fase = 0) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle; //si no nulo, rotación suera de plano
  planeta.add(pivote);
  var geom = new THREE.SphereGeometry(radio, 30, 30);
  var mat = new THREE.MeshBasicMaterial({ color: col });
  var luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;
  luna.userData.fase = fase;

  Lunas.push(luna);
  pivote.add(luna);
}

...

function animationLoop() {
  
  ...

  for (let object of Lunas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed + object.userData.fase) * object.userData.dist;
    object.position.z =
      Math.sin(timestamp * object.userData.speed + object.userData.fase) * object.userData.dist;
  }

  ...
}
```

Esto se ha implementado principalmente porque para poder añadir correctamente a los gemelos "Brasa" y "Ceniza" de forma que orbitaran entre ellos, se ha optado por crear un planeta de dimensiones muy pequeñas e invisible, de forma que estos dos planetas se implementan como lunas que orbitan a este planeta invisible (se añadió el parámetro de fase para que uno de los dos comience orbitando al "planeta" desde el lado opuesto al otro y nunca lleguen a chocar o a solaparse dado que orbitan a la misma velocidad y distancia)

<img src="./capturas/gemelos_orbitando.gif" alt="Gemelos Brasa y Ceniza" width="100%">

De esta manera se consigue el efecto de que son dos planeas que orbitan entre ellos mientran orbitan juntos al Sol

El resto de planetas y lunas se añaden usando las funciones básicas de Planeta() y Luna()

<img src="./capturas/sistema_sin_texturas.gif" alt="Sistema planetario sin texturas" width="100%">

### Luces y sombras en el sistema planetario

El siguiente paso consiste en lograr que el Sol y el Farol de Hondonada den luz a los cuerpos celestes a su alrededor, y que estos tengan sombras y den sombra a los cuerpos que se pongan detrás suyo, para esto se han utilizado los ejemplos del guión de la práctica 7

Para esto se ha implementado una función crearFuenteDeLuz() que crea una fuente de luz puntual dado un objeto en la escena, y se ha incluido dentro de la función Estrella()

```js
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

...

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
```

<img src="./capturas/luces_y_sombras.gif" alt="Sistema planetario sin texturas" width="100%">

Además se ha utilizado esta nueva función para lograr que el Farol de Hondonada produzca luz debido a que en el juego, es un planeta volánico que produce luz como una estrella

```js
// Farol de Hondonada
Luna(Planetas[2], 1, 9, 0.06 * TIME_SCALE, 0x8b4a2b, 0);

crearFuenteDeLuz(Lunas[3], {
  color: 0xffaa00,
  intensidad: 2,
  distancia: 30,
  decay: 2,
  sombras: false,
});
```

<img src="./capturas/farol_de_hondonada.gif" alt="Sistema planetario sin texturas" width="100%">

En el video anterior se puede observar un pequeño seguimiento a la órbita de Hondonada Frágil y la luz generada por el Farol de Hondonada