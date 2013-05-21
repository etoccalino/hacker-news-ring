RingApp = function () {
  // Borrow constructor from Sim.App
  Sim.App.call(this);
}
RingApp.prototype = new Sim.App();

RingApp.VIEWING_DISTANCE = 1;
RingApp.ELEMENTS_NUMBER = 7;

RingApp.prototype.init = function (params) {

  // Borrow initializer from Sim.App to set up scene, renderer, camera
  Sim.App.prototype.init.call(this, params);

  // Create a directional light to show off the model
  var light = new THREE.DirectionalLight( 0xffffff, 1);
  light.position.set(0, -1, 1).normalize();
  this.scene.add(light);

  // Position the camera to viewing distance
  this.camera.position.set(0, 0, Ring.RADIUM + RingApp.VIEWING_DISTANCE);

  // Add the ring of elements
  var ring = new Ring();
  ring.init();
  this.addObject(ring);

  // Keep track of the selected element
  this.selected = 0;
}


//
//
//

Ring = function () {
  Sim.Object.call(this);
}
Ring.prototype = new Sim.Object();

Ring.RADIUM = 1;

Ring.prototype.init = function () {
  // The ring group to move elements together
  this.setObject3D(new THREE.Object3D());

  // Add the ring elements
  for (var i = 0; i < RingApp.ELEMENTS_NUMBER; i++) {
    var element = new RingElement();

    element.init({index: i});

    // Add the element to the ring
    this.object3D.add(element.mesh);
  }
}

//
//
//

RingElement = function () {
  // Borrow the Sim.Object constructure
  Sim.Object.call(this);
}
RingElement.prototype = new Sim.Object();

RingElement.WIDTH = 1;
RingElement.COLOR_MAP = [
  0x0000ff,
  0x00ff00,
  0xff0000,
  0x101010];

RingElement.prototype.init = function (params) {
  this.params = params || {};

  var geometry = new THREE.CubeGeometry(RingElement.WIDTH, RingElement.WIDTH, RingElement.WIDTH, 16, 16, 16)
    , color = RingElement.COLOR_MAP[this.params.index]
    , material = new THREE.MeshPhongMaterial({color: color})
    , mesh = new THREE.Mesh(geometry, material)
    , f = Math.PI * 2 / RingApp.ELEMENTS_NUMBER;

  // Position it around the ring
  mesh.position.x = Ring.RADIUM * Math.sin(f * params.index);
  mesh.position.z = Ring.RADIUM * Math.cos(f * params.index);

  // Rotate the element to face outside
  mesh.rotation.y = f * params.index;

  // Keep a reference to the mesh to handle mouse events
  this.mesh = mesh;
}

RingElement.prototype.handleMouseOver = function(x, y)
{
  this.mesh.material.ambient.setRGB(.2,.2,.2);
}

RingElement.prototype.handleMouseOut = function(x, y)
{
  this.mesh.material.ambient.setRGB(0, 0, 0);
}
