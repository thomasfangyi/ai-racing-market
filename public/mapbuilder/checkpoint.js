var currentRotation = 0.001;
var initialDirection = [1, 0]
var currentDirection = initialDirection;
var centre = [0, 0]
var length = 100;
var rotationSpeed = 0.02, currentRotationSpeed = 0;
var gateStart, gateEnd;

var currentGate = new PIXI.Graphics();
var gateColour = 0x0000FF;
var gateThickness = 0.05;
var startGateColour = 0x000000;

function updateRotation(a) {
  p = initialDirection;
  currentDirection = [Math.cos(a) * p[0] + Math.sin(a) * p[1],
                      Math.cos(a) * p[1] - Math.sin(a) * p[0]]
}

function endPoint(centre, currentDirection, length, polygons) {
  // Find intersection with polygons
  var smallestDist = length/2;
  for (var i in polygons) {
    p = polygons[i];
    var intersect = PolyK.Raycast(p, centre[0], centre[1], currentDirection[0], currentDirection[1])
    if (intersect != null && intersect.dist < smallestDist) {
      smallestDist = intersect.dist;
    }
  }
  return add(centre, mul(currentDirection, smallestDist));
}

function updateGateHover(mousePoint, polygons) {
  updateRotation(currentRotation);

  centre = mousePoint;
  gateEnd = endPoint(centre, currentDirection, length/2, polygons);
  gateStart = endPoint(centre, mul(currentDirection, -1), length/2, polygons);

  setStartLine(currentGate, gateStart);
  setEndLine(currentGate, gateEnd);
}

function addGateLine(container) {
  container.addChild(currentGate);
}

// Start gate rotation
document.addEventListener('keydown', function onKeyPress(evt){
  switch (evt.keyCode) {
    case 188: currentRotationSpeed = rotationSpeed
              break;
    case 190: currentRotationSpeed = -rotationSpeed
              break;
  }
});

// Stop gate rotation
document.addEventListener('keyup', function onKeyPress(evt){
  switch (evt.keyCode) {
    case 188:
    case 190: currentRotationSpeed = 0;
              break;
  }
});

// Update rotation each draw step
function updateGateRotation(polygons) {
  currentRotation += currentRotationSpeed;
  updateGateHover(centre, polygons);
}

// Initialise gate drawing line
currentGate.lineStyle(0.035, gateColour, 0.8);
currentGate.moveTo(centre[0], centre[1]);
var initialEndPoint = endPoint(centre, currentDirection, length);
currentGate.lineTo(initialEndPoint[0], initialEndPoint[1])
