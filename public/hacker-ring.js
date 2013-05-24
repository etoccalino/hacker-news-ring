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
RingApp.ELEMENT_COLORS = [0x0000ff, 0x000050, 0x00ff00, 0x005000, 0xff0000, 0x500000, 0x101010];

RingApp.prototype.init = function (params) {

  // Borrow initializer from Sim.App to set up scene, renderer, camera
  Sim.App.prototype.init.call(this, params);

  // Create a directional light to show off the model
  var light = new THREE.DirectionalLight( 0xffffff, 1);
  light.position.set(0, -1, 1).normalize();
  this.scene.add(light);

  // Position the camera to viewing distance
  this.camera.position.set(0, 0, Ring.RADIUM + RingApp.VIEWING_DISTANCE);
}

RingApp.prototype.update = function () {
  TWEEN.update();
  Sim.App.prototype.update.call(this);
}

RingApp.prototype.updateNews = function (news) {
  if (! this.ring) {

    // Add the ring of elements
    var ring = new Ring();
    ring.init();
    this.addObject(ring);

    this.ring = ring;
  }
  // Delegate on the only ring
  return this.ring.updateNews(news);
}

RingApp.prototype.handleMouseDown = function(x, y)
{
  var width = this.container.clientWidth
    , xToCenter = x - width / 2;

  //
  // ERROR: xToCenter is in pixes, Ring.ELEMENT_WIDTH is in meters
  //
  if (Math.abs(xToCenter) < Ring.ELEMENT_WIDTH*100 / 2) {
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

// Compute the radium of the ring, and the element angle
Ring.ELEMENT_WIDTH = 1;
Ring.RADIUM = (3 * RingApp.ELEMENTS_NUMBER * Ring.ELEMENT_WIDTH) / (4 * Math.PI);
Ring.ANGLE = 2 * Math.PI / RingApp.ELEMENTS_NUMBER;


Ring.prototype.init = function () {
  // The ring group to move elements together
  this.setObject3D(new THREE.Object3D());

  // Keep a reference to the elements
  this.elements = [];

  // Add the ring elements
  for (var i = 0; i < RingApp.ELEMENTS_NUMBER; i++) {
    var element = new RingElement();

    element.init({radium: Ring.RADIUM, index: i});

    // Add the element to the ring
    this.addChild(element);

    this.elements.push(element);
  }

  // Keep track of the selected element
  this.selected = 0;
}

Ring.prototype.select = function () {
  this.elements[this.selected].goTo();
}

Ring.prototype.updateNews = function (news) {
  // Update each element
  for (var i = 0; i < news.length; i++) {
    this.elements[i].updateText(news[i]);
  }
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
  this.rotate(-Ring.ANGLE);

  this.selected += 1;
  if (this.selected == RingApp.ELEMENTS_NUMBER) this.selected = 0;
}

Ring.prototype.rotateCounterClockwise = function () {
  this.rotate(Ring.ANGLE);

  this.selected -= 1;
  if (this.selected < 0) this.selected = RingApp.ELEMENTS_NUMBER - 1;
}

//
//
//

RingElement = function () {
  // Borrow the Sim.Object constructure
  Sim.Object.call(this);
}
RingElement.prototype = new Sim.Object();

RingElement.prototype.init = function (params) {
  this.params = params || {};

  // Create a group for the page and its text
  this.setObject3D(new THREE.Object3D());

  // Compute the element's position and orientation around the ring
  var f = Math.PI * 2 / RingApp.ELEMENTS_NUMBER
    , position = {
        x: this.params.radium * Math.sin(f * this.params.index)
      , y: 0
      , z: this.params.radium * Math.cos(f * this.params.index)
    }
    , rotation = {
        x: 0
      , y: f * this.params.index
      , z: 0
    };

  // Create a page on which to write
  this.createPage();

  // Position it around the ring
  this.object3D.position = position;

  // Rotate the element to face outside
  this.object3D.rotation = rotation;
}

RingElement.prototype.createPage = function () {

  var geometry = new THREE.PlaneGeometry(Ring.ELEMENT_WIDTH, Ring.ELEMENT_WIDTH, 16, 16)
    , color = RingApp.ELEMENT_COLORS[this.params.index]
    , material = new THREE.MeshBasicMaterial({color: color})
    , mesh = new THREE.Mesh(geometry, material);

  // Pages are double sided, to cover the text
  mesh.doubleSided = true;

  // Add the page to this element group
  this.object3D.add(mesh);
}

RingElement.prototype.updateText = function (news) {
  // Loose the old text, if any
  if (this.text)
    this.text.destroy();

  this.text = new Text();

  // Let the Text object add the meshes to the Object3D
  this.text.init(news.headline, {root: this.object3D});

  this.url = news.url;
}

RingElement.prototype.goTo = function () {
  window.document.location = this.url;
}


//
//
//

Text = function () {
  Sim.Object.call(this);
}
Text.prototype = new Sim.Object();

Text.SIZE = .1;
Text.HEIGHT = .02;
Text.CURVESEGMENTS = 2;
Text.LINE_HEIGHT = 2 * Text.SIZE;

Text.MAX_LINES_PER_PAGE = 4;
Text.MAX_CHARS_PER_PAGE = 15;

Text.MATERIAL = new THREE.MeshPhongMaterial({color: 0xf0f0f0, overdraw: true});

Text.prototype.init = function (fullText, params) {
  params = params || {};
  this.root = params.root

  this.size = params.size || Text.SIZE;
  this.height = params.height || Text.HEIGHT;
  this.curveSegments = params.curveSegments || Text.CURVESEGMENTS;

  // Dissasembly the full text into a list of words
  var words = fullText.split(' ');

  // Reassemble the full text a sequence of lines
  var lines = []
    , line = words[0];
  for (var i = 1; i < words.length; i++) {
    if (line.length + words[i].length + 1 > Text.MAX_CHARS_PER_PAGE) {
      lines.push(line);
      line = words[i];
    }
    else {
      line += ' ' + words[i];
    }
  }
  if (line.length > 0) lines.push(line);

  // Truncate the text to the total number of lines allowed
  lines = lines.slice(0, Text.MAX_LINES_PER_PAGE);

  // Contruct a text geometry for each line
  for (var i = 0; i < lines.length; i++) {

    var geometry = new THREE.TextGeometry(lines[i], {
      size: this.size,
      height: this.height,
      curveSegments: this.curveSegments,
      font: 'helvetiker'
    });

    // Build this text mesh
    var mesh = new THREE.Mesh(geometry, Text.MATERIAL);

    // Position the mesh centered in x
    geometry.computeBoundingBox();
    var centerOffset = -0.5 * (geometry.boundingBox.x[1] - geometry.boundingBox.x[0]);
    mesh.position.x += centerOffset;

    // Position this line's mesh above / below as it corresponds
    mesh.position.y = - Text.LINE_HEIGHT * (i - Math.floor(lines.length / 2));

    // Move it slightly closer, to avoid piercing the page
    mesh.position.z = 0.1 * this.height;

    // Add this line to the root object
    this.root.add(mesh);
  }
}
