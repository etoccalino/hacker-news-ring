RingApp = function () {
  // Borrow constructor from Sim.App
  Sim.App.call(this);
}
RingApp.prototype = new Sim.App();

RingApp.MOUSE_MOVE_TOLERANCE = 2;
RingApp.MAX_CAMERA_Z = 1000;
RingApp.MIN_CAMERA_Z = 1;

RingApp.VIEWING_DISTANCE = 2;

RingApp.ELEMENTS_NUMBER = 7;
RingApp.COLOR_MAP = [
  0x0000ff,
  0x000050,
  0x00ff00,
  0x005000,
  0xff0000,
  0x500000,
  0x101010];

RingApp.URL_MAP = [
  'http://google.com',
  'http://yahoo.com',
  'http://news.ycombinator.com',
  'http://stackoverflow.com',
  'http://github.com',
  'http://creativa77.com.ar'];


RingApp.prototype.init = function (params) {

  // Borrow initializer from Sim.App to set up scene, renderer, camera
  Sim.App.prototype.init.call(this, params);

  // Create a directional light to show off the model
  var light = new THREE.DirectionalLight( 0xffffff, 1);
  light.position.set(0, -1, 1).normalize();
  this.scene.add(light);

  // Add the ring of elements
  var ring = new Ring();
  ring.init();
  this.addObject(ring);

  this.ring = ring;

  // Position the camera to viewing distance
  this.camera.position.set(0, 0, ring.radium + RingApp.VIEWING_DISTANCE);
}

RingApp.prototype.update = function () {
  TWEEN.update();
  Sim.App.prototype.update.call(this);
}

RingApp.prototype.handleMouseDown = function(x, y)
{
  var width = this.container.clientWidth
    , xToCenter = x - width / 2;

  //
  // ERROR: xToCenter is in pixes, RingElement.WIDTH is in meters
  //
  if (Math.abs(xToCenter) < RingElement.WIDTH*100 / 2) {
    // Clicked on the front element
    this.ring.select();
  }
  else {
    // Trigger elements rotation
    if (xToCenter > 0) {
      this.ring.rotateClockwise();
    }
    else {
      this.ring.rotateCounterClockwise();
    }
  }
}

RingApp.prototype.handleMouseScroll = function(delta)
{
  var dx = delta;

  this.camera.position.z -= dx;

  // Clamp to some boundary values
  if (this.camera.position.z < RingApp.MIN_CAMERA_Z)
    this.camera.position.z = RingApp.MIN_CAMERA_Z;
  if (this.camera.position.z > RingApp.MAX_CAMERA_Z)
    this.camera.position.z = RingApp.MAX_CAMERA_Z;
}


//
//
//

Ring = function () {
  Sim.Object.call(this);
}
Ring.prototype = new Sim.Object();

Ring.ANIMATION_INTERVAL = 500;

Ring.prototype.init = function () {
  // The ring group to move elements together
  this.setObject3D(new THREE.Object3D());

  // Keep a reference to the elements
  this.elements = [];

  // Compute the radium of the ring, and the element angle
  this.radium = (3 * RingApp.ELEMENTS_NUMBER * RingElement.WIDTH) / (4 * Math.PI);
  this.angle = 2 * Math.PI / RingApp.ELEMENTS_NUMBER;

  // Add the ring elements
  for (var i = 0; i < RingApp.ELEMENTS_NUMBER; i++) {
    var element = new RingElement();

    element.init({radium: this.radium, index: i});

    // Add the element to the ring
    this.object3D.add(element.mesh);

    this.elements.push(element);
  }

  // Keep track of the selected element
  this.selected = 0;
}

Ring.prototype.select = function () {
  this.elements[this.selected].goTo();
}

Ring.prototype.rotate = function (deltaY) {
  if (! this.animating) {
    // Lock the animation
    this.animating = !this.animating;

    // Compute the final value to tween to
    var newY = this.object3D.rotation.y + deltaY;

    // Start TWEEN, the app will update it
    var that = this;
    new TWEEN.Tween(this.object3D.rotation)
      .to({y: newY}, Ring.ANIMATION_INTERVAL)
      .easing(TWEEN.Easing.Quadratic.EaseIn)
      .onComplete(function () {
        // Unlock the animation
        that.animating = !that.animating;
      })
      .start();
  }
}

Ring.prototype.rotateClockwise = function () {
  this.rotate(-this.angle);

  this.selected -= 1;
  if (this.selected < 0) this.selected = RingApp.ELEMENTS_NUMBER - 1;
}

Ring.prototype.rotateCounterClockwise = function () {
  this.rotate(this.angle);

  this.selected += 1;
  if (this.selected == RingApp.ELEMENTS_NUMBER) this.selected = 0;
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

RingElement.prototype.init = function (params) {
  this.params = params || {};

  var geometry = new THREE.PlaneGeometry(RingElement.WIDTH, RingElement.WIDTH, 16, 16)
    , color = RingApp.COLOR_MAP[this.params.index]
    , material = new THREE.MeshBasicMaterial({color: color})
    , mesh = new THREE.Mesh(geometry, material)
    , f = Math.PI * 2 / RingApp.ELEMENTS_NUMBER;

  mesh.doubleSided = true;

  // Position it around the ring
  mesh.position.x = this.params.radium * Math.sin(f * this.params.index);
  mesh.position.z = this.params.radium * Math.cos(f * this.params.index);

  // Rotate the element to face outside
  mesh.rotation.y = f * params.index;

  // Keep a reference to the mesh to handle mouse events
  this.mesh = mesh;
}

RingElement.prototype.goTo = function () {
  window.document.location = RingApp.URL_MAP[this.params.index];
}
