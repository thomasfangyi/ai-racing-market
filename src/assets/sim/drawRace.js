/**
 * Created by ruiaohu on 27/05/2017.
 */
var zoom = 20;
var cars = {};
var carWidth;
var carHeight;
var numRays;
var wall_colour = 0xD7D7D7;
var clientCarID = null;
var canvas;
var renderer;
var stage;
var container;
var currentMap;

function initDraw() {
    //Map
    currentMap = new _Map();

    // Create the PIXI renderer
    console.log(document.body.childElementCount);

    canvas = document.getElementById('PIXIcanvas');
    renderer = new PIXI.CanvasRenderer(canvas.width, canvas.height, canvas, false);
    // Make the canvas focusable
    renderer.view.tabIndex = 0;
    stage = new PIXI.Stage(0xFFFFAA);
    renderer.backgroundColor = 0x181818;
    container = new PIXI.DisplayObjectContainer();
    stage.addChild(container);
    document.body.appendChild(renderer.view);
    renderer.view.focus();

    // document.body.removeChild(canvas);
    // Reference Square
    // var colour = 0xFFFF00;
    // referenceSquare = new PIXI.Graphics();
    // referenceSquare.beginFill(colour, 0.3);
    // referenceSquare.lineStyle(0.01, colour, 1);
    // referenceSquare.drawRect(-5, -5, 10, 10);
    // container.addChild(referenceSquare);

    // Add transform to the container
    container.position.x = renderer.width / 2; // center at origin
    container.position.y = renderer.height / 2;
    container.scale.x = zoom;  // zoom in
    container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"
    renderer.render(stage); // Initial render

    // User control
    // renderer.view.addEventListener('keydown', onKeyPress);
    // function onKeyPress(evt) {
    //   keys[evt.keyCode] = 1;
    //   syncServerWithMovement();
    // }
    //
    // renderer.view.addEventListener('keyup', onKeyRelease);
    // function onKeyRelease(evt) {
    //   keys[evt.keyCode] = 0;
    //   syncServerWithMovement();
    // }

}

function drawMap(map, checkpoints, startGate) {
    for (let i in map) {
        let segment = new Segment(map[i]);
        currentMap.addSegment(segment);
        segment.drawSegment(container, wall_colour);
    }
    for (let i in checkpoints) {
        let gate = new Gate(checkpoints[i][0], checkpoints[i][1], 0xFFFFFF);
        currentMap.addGate(gate);
        gate.drawGate(container, 0.02);
    }
    startGate = new Gate(startGate[0], startGate[1], 0xFF0000);
    currentMap.setStartGate(startGate);
    startGate.drawGate(container, 0.06);
}

function updateAllGraphics(info) {
    for (let id in info) {
        if (!info.hasOwnProperty(id)) continue;
        let car = info[id];
        if (cars[id] === undefined) {
            cars[id] = new RaceCarGraphic(car.colour);
        }
        cars[id].carGraphic.position.x = car.position[0];
        cars[id].carGraphic.position.y = car.position[1];
        cars[id].carGraphic.rotation = car.angle;

        // Centre client view on the car they control
        if (clientCarID === car.clientID) {
            container.position.x = -cars[id].carGraphic.position.x * zoom + renderer.width / 2; // center at origin
            container.position.y = cars[id].carGraphic.position.y * zoom + renderer.height / 2;
        }

        // Draw the cars detection rays
        for (let j = 0; j < car.rayEnds.length; j++) {
            let rayEnd = car.rayEnds[j];
            cars[id].rayGraphics[j].currentPath.shape.points = [car.position[0], car.position[1], rayEnd[0], rayEnd[1]];
        }
    }

    requestAnimationFrame(function () {
        renderer.render(stage);
    });
}

function initWorld(info) {
    carWidth = info.carWidth;
    carHeight = info.carHeight;
    numRays = info.numRays;
    clientCarID = info.id;
    drawMap(info.map, info.checkpoints, info.startGate);
    updateAllGraphics(info.cars);
}

function updateMap(info) {
    console.log(info);
}

// Abstract information required for car drawing
function RaceCarGraphic(colour) {
    this.carGraphic = new PIXI.Graphics();

    this.carGraphic.beginFill(colour, 0.3);
    this.carGraphic.lineStyle(0.01, colour, 1);
    this.carGraphic.drawRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);

    this.rayGraphics = [];
    for (let i = 0; i < numRays; i++) {
        let rayGraphic = new PIXI.Graphics();
        rayGraphic.lineStyle(0.01, 0xfffff, 1);
        rayGraphic.moveTo(0, 0);
        rayGraphic.lineTo(0, 0);
        container.addChild(rayGraphic);
        this.rayGraphics.push(rayGraphic);
    }
    container.addChild(this.carGraphic);
}

function removeUser(id) {
    let car = cars[id];
    if (car === undefined) return;
    for (let ray_id in car.rayGraphics) {
        container.removeChild(car.rayGraphics[ray_id]);
    }
    container.removeChild(car.carGraphic);
    cars[id] = undefined;
}

