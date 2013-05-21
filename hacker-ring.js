var RingApp = function () {
  // Borrow constructor from Sim.App
  Sim.App.call(this);
}
RingApp.prototype = new Sim.App();

RingApp.RADIUM = 1;
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
  this.camera.position.set(0, 0, RingApp.RADIUM + RingApp.VIEWING_DISTANCE);

  // Add the elements to form the ring
  this.addRingElements();

  // Keep track of the selected element
  this.selected = 0;
}

RingApp.prototype.addRingElements = function () {
  // The ring group to move elements together
  var ring = new Sim.Object()
    , group = new THREE.Object3D();
  this.addObject(ring);

  var f = Math.PI * 2 / RingApp.ELEMENTS_NUMBER;

  for (var i = 0; i < RingApp.ELEMENTS_NUMBER; i++) {
    var element = new RingElement();

    element.init({index: i});

    // Position it around the ring
    element.object3D.position.x = RingApp.RADIUM * Math.sin(f * i);
    element.object3D.position.z = RingApp.RADIUM * Math.cos(f * i);

    // Rotate the element to face outside
    element.object3D.rotation.y = f * i;

    // Add the element to the ring
    group.add(element);
  }
  ring.setObject3D(group);
}

//
//
//

var RingElement = function () {
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

  var group = new THREE.Object3D()
    , geometry = new THREE.CubeGeometry(RingElement.WIDTH, RingElement.WIDTH, RingElement.WIDTH, 16, 16, 16)
    , color = RingElement.COLOR_MAP[this.params.index]
    , material = new THREE.MeshPhongMaterial({color: color})
    , mesh = new THREE.Mesh(geometry, material);

  // Build an object for the element
  group.add(mesh);
  this.setObject3D(group);

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
