CameraControls.install({ THREE: THREE });

class Star extends THREE.Mesh {
  constructor(
    geometry,
    material,
    designation,
    distance,
    luminosity,
    spectralType,
    constellation
  ) {
    super(geometry, material);
    this.designation = designation;
    this.distance = distance;
    this.luminosity = luminosity;
    this.spectralType = spectralType;
    this.constellation = constellation;
  }
}

const clock = new THREE.Clock();

// Our Javascript will go here.
// To display anything with three.js, we need scene, camera and renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 15;

const loadingManager = new THREE.LoadingManager(() => {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.classList.add('fade-out');

  // optional: remove loader from DOM via event listener
  loadingScreen.addEventListener('transitionend', onTransitionEnd);
});

const loader = new THREE.TextureLoader();
const bgTexture = loader.load('img/milkyWayBackground.jpg');
scene.background = bgTexture;

var starTexture = loader.load('img/grey_star4.jpg');

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

var controls = new CameraControls(camera, renderer.domElement);
var light = new THREE.PointLight(0xffff00);

light.position.set(10, 0, 25);
scene.add(light);

var mouse = new THREE.Vector2(1, 1);
var raycaster = new THREE.Raycaster();
var INTERSECTED;
var prevIntersected;
var oldColor;

// document.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('dblclick', onDblclick, false);

// load file
const hygData = [];
var selected;
var designationDiv = document.getElementById('designation');
var constellationDiv = document.getElementById('constellation');
var spectralDiv = document.getElementById('spectralType');
var luminosityDiv = document.getElementById('luminosity');
var distanceDiv = document.getElementById('distance');
var coordDiv = document.getElementById('coordinates');

function loadData() {
  d3.csv('data/hygdata_prepared.csv').then(function(data) {
    data.forEach(function(d) {
      d.xCoord = +d.xCoord;
      d.yCoord = +d.yCoord;
      d.zCoord = +d.zCoord;
      d.scaledMagnitude = +d.scaledMagnitude;
      d.absoluteMagnitude = +d.absoluteMagnitude;
      d.spectralColor = +d.spectralColor;
      hygData.push(d);
    });

    for (var i = 0; i < hygData.length; i++) {
      var x = hygData[i].xCoord;
      var y = hygData[i].yCoord;
      var z = hygData[i].zCoord;
      var scaledMagnitude = hygData[i].scaledMagnitude;
      var spectralColor = hygData[i].spectralColor;
      var designation = hygData[i].designation;
      var distance = hygData[i].distance;
      var luminosity = hygData[i].luminosity;
      var spectralType = hygData[i].spectralType;
      var constellation = hygData[i].constellation;
      //console.log(hygData[i].spectralColor);

      var coordinates = new THREE.Vector3(x, y, z);
      var SphereGeometry = new THREE.SphereGeometry(
        scaledMagnitude / 1.75,
        8,
        8
      );
      var material = new THREE.MeshBasicMaterial({
        color: spectralColor,
        map: starTexture
      });
      // var mesh = new THREE.Mesh(SphereGeometry, material);
      var mesh = new Star(
        SphereGeometry,
        material,
        designation,
        distance,
        luminosity,
        spectralType,
        constellation
      );

      mesh.position.x = x;
      mesh.position.y = y;
      mesh.position.z = z;

      if (i == 0) {
        selected = mesh;
        designationDiv.textContent = 'designation: ' + mesh.designation;
        constellationDiv.textContent = 'constellation: ' + mesh.constellation;
        spectralDiv.textContent = 'spectral type: ' + mesh.spectralType;
        luminosityDiv.textContent = 'luminosity: ' + mesh.luminosity;
        distanceDiv.textContent = 'distance: ' + mesh.distance;
        coordDiv.textContent = 'coordinates: ' + mesh.position.x;

        prevIntersected = mesh;
      }

      scene.add(mesh);

      if (i == hygData.length - 1) {
        animate();
        controls.forward(
          camera.position.distanceTo(prevIntersected.position) - 0.5
        );
        controls.setTarget(
          prevIntersected.position.x,
          prevIntersected.position.y,
          prevIntersected.position.z,
          false
        );
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        loadingScreen.addEventListener('transitionend', onTransitionEnd);
      }
    }
  });
}

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
  event.preventDefault();
  if (INTERSECTED) {
    designationDiv.textContent = 'designation: ' + INTERSECTED.designation;
    constellationDiv.textContent =
      'constellation: ' + INTERSECTED.constellation;
    spectralDiv.textContent = 'spectral type: ' + INTERSECTED.spectralType;
    luminosityDiv.textContent = 'luminosity: ' + INTERSECTED.luminosity;
    distanceDiv.textContent = 'distance: ' + INTERSECTED.distance;
    coordDiv.textContent = 'coordinates: ' + INTERSECTED.position.x;
  }
}

function onDblclick(event) {
  event.preventDefault();

  switch (event.which) {
    case 1: // left mouse click
      if (INTERSECTED) {
        var camerapos = camera.position;
        camerapos.setLength(0.5);

        controls.setLookAt(
          INTERSECTED.position.x - camerapos.x,
          INTERSECTED.position.y - camerapos.y,
          INTERSECTED.position.z - camerapos.z,
          INTERSECTED.position.x,
          INTERSECTED.position.y,
          INTERSECTED.position.z,
          true
        );
      }
      break;

    case 3: // right mouse click
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

var button = document.getElementById('sunButton');
button.addEventListener(
  'click',
  function() {
    var camerapos = camera.position;
    camerapos.setLength(0.5);
    controls.setLookAt(
      prevIntersected.position.x - camerapos.x,
      prevIntersected.position.y - camerapos.y,
      prevIntersected.position.z - camerapos.z,
      prevIntersected.position.x,
      prevIntersected.position.y,
      prevIntersected.position.z,
      true
    );
  },
  false
);

var button = document.getElementById('startButton');
button.addEventListener(
  'click',
  function() {
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('fade-out');
    startScreen.remove();
    loadData();
  },
  false
);

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const hasControlsUpdated = controls.update(delta);
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    // if the closest object intersected is not the currently stored intersection object
    if (intersects[0].object != INTERSECTED) {
      // restore previous intersection object (if it exists) to its original color
      if (INTERSECTED)
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[0].object;
      // store color of closest object (for later restoration)
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // set a new color for closest object
      INTERSECTED.material.color.setHex(0x00ff00);
    }
  } // there are no intersections
  else {
    // restore previous intersection object (if it exists) to its original color
    if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }

  // render the scene
  renderer.render(scene, camera);
}

function onTransitionEnd(event) {
  event.target.remove();
}
