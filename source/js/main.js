// Has acces to the DOM with canvas
const canvas = document.getElementById('canvas');

//create sceneManager with canvas
const sceneManager = new SceneManager(canvas);

bindEventListeners();
render();

function bindEventListeners() {
  window.onresize = resizeCanvas;
  resizeCanvas();
}

function resizeCanvas() {
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  sceneManager.onWindowResize();
}

// start render loop
function render() {
  requestAnimationFrame(render);
  sceneManager.update();
}
