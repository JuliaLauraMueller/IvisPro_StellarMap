// name of SceneSubject
function SceneSubject(scene) {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  this.update = function() {
    // do something
  };
}
