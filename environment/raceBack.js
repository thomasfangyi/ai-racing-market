/**
 * Created by ruiaohu on 27/05/2017.
 */
const p2 = require('p2');
const hashMap = require('hashmap');
const RaceCar = require('./RaceCar');
const rays = require('./rays');

const result = new p2.RaycastResult();
const hitPoint = p2.vec2.create();

const fixedTimeStep = 0.06;
const raceCars = new hashMap.HashMap();
const maxSteer = Math.PI / 5;
// Create the world
const world = new p2.World({
    gravity : [0,0]
});

class map{
  constructor (segments, checkpoints, startGate) {
    this.segments = segments;
    this.checkpoints = checkpoints;
    this.startGate = startGate;

    this.save = JSON.parse(JSON.stringify(segments));// Required since p2 manipulates array
    this.mapPolys = [];
    this.mapCheckpoints = new hashMap.HashMap();

    this.removeMap = function () {
      for (let i in this.mapPolys) {
        world.removeBody(this.mapPolys[i]);
      }
      this.mapCheckpoints.clear();
    };

    this.drawCheckpoints = function() {
      this.mapCheckpoints.forEach(function(value, ray){
        p2.vec2.copy(ray.from, value[1]);
        p2.vec2.copy(ray.to, value[2]);
        ray.update();
        result.reset();
        world.raycast(result, ray);
      });
    }


    this.createMap = function () {
      for (let p = 0; p < this.segments.length; p++) {
        this.mapPolys.push(createMapSegment(this.segments[p]));
      }
      for (let i = 0; i < this.checkpoints.length;i++){
        let checkpoint = new p2.Ray({
          mode: p2.Ray.ALL,
          collisionMask:-1^Math.pow(2,31),
          callback: function(result){
            checkpointResult(result, this);
          }
        });
        this.mapCheckpoints.set(checkpoint, [i,checkpoints[i][0], checkpoints[i][1]]);
      }
    }
  }
}

function checkpointResult(result, ray){
    result.getHitPoint(hitPoint, ray);
    let car = raceCars.get(result.body.id);

  // TODO: send checkpoint to AI (reward signal);
}

function createMapSegment (segment) {
  let map = new p2.Body({
      mass : 1,
      position:[0,0],
      type: p2.Body.STATIC,
  });
  map.fromPolygon(segment);
  world.addBody(map);

  /*************Blame the p2 author for bad API design **************/
  for(let i = 0; i<map.shapes.length;i++){
    map.shapes[i].collisionMask = -1;
    map.shapes[i].collisionGroup = Math.pow(2,31);
  }
  /*******************************************************************/
  return map
}

let current_map = new map(require('./maps/map1.js')["map1"], [[[0,0],[0,0]]]);
current_map.createMap();

// Gets map to send to users
function getMap() {
  return current_map.save;
}

// For now, set default friction between ALL objects
// In future may wish to have it vary between objects
world.defaultContactMaterial.friction = 0.001;

function packageGraphics () {
    let graphics_dict = {};
    raceCars.forEach(function (raceCar, key) {
        graphics_dict[raceCar.clientID] = {
            position: raceCar.box_graphic.position,
            angle: raceCar.box_graphic.angle,
            rayEnds: raceCar.rayEnds,
            colour: raceCar.colour,
            clientID: raceCar.clientID
        }
    });
    return graphics_dict;
}

function addRaceCar(clientID, position) {
    let car = new RaceCar.RaceCar(raceCars.count()+1, clientID, world, position);
    raceCars.set(clientID, car);
    return car;
}

function addClient(id){
    console.log('USER', id);
    const initPosition = [5, 5];
    addRaceCar(id, initPosition);
}

// Send details of p2 race car to its graphical counterpart
function updateGraphics () {
    raceCars.forEach(function (value, key) {
        //update information of each racer.
        value.updateGraphics();
        rays.constructRays(value,RaceCar.numRays,world);
    });

}
function updateMovement(keys, id){
    let control = {};
    control["steerValue"] = keys[37] - keys[39];
    if (keys[38] && keys[40]) control["engineForce"] = 0;
        else if (keys[38]) control["engineForce"] = 1;
        else if (keys[40]) control["engineForce"] = -0.5;
        else control["engineForce"] = 0;
    applyMove(control, id);
}

function applyMove(control, id) {
    let clientCar = raceCars.get(id);
    if (clientCar === null || clientCar === undefined) {
        console.error(`Applying a move to null car ${id}`);
        return;
    }
    // Steer value zero means straight forward. Positive is left and negative right.
    if (control["steerValue"] !== undefined && control["steerValue"] !== null) {
        let steerValue = maxSteer * Math.min(Math.max(control["steerValue"], -1), 1);
        clientCar.frontWheel.steerValue = steerValue;
    }
    if (control["engineForce"] !== undefined && control["engineForce"] !== null) {
        let engineForce = Math.min(Math.max(control["engineForce"], -0.5), 1);
        clientCar.backWheel.engineForce = engineForce;
        let breaking = (clientCar.backWheel.getSpeed() > 0.1 && engineForce < 0)
            || (clientCar.backWheel.getSpeed() < -0.1 && engineForce > 0);
        clientCar.backWheel.setBrakeForce(breaking ? 5 : 0);
    }
}

// p2 implementation of vehicle.removeFromWorld is buggy; doesn't remove the chassis
function removeVehicle(vehicle) {
    world.removeBody(vehicle.chassisBody);
    vehicle.removeFromWorld();
}

function removeUser(id){
    let car = raceCars.get(id);
    if (car !== undefined && car !== null)
        removeVehicle(car.vehicle);
    raceCars.remove(id);
}

function carCount(){
    let num = raceCars.count();
    return num;
}

function getCarById(carId) {
    return raceCars.get(carId);
}

// Loop the program
setInterval(function(){
    world.step(fixedTimeStep);
    current_map.drawCheckpoints();
    // Update graphics
    updateGraphics ();
}, 1000/30);

function initIO(clientID){
    return {
        numCars:carCount(),
        carWidth: RaceCar.carWidth,
        carHeight: RaceCar.carHeight,
        numRays: RaceCar.numRays,
        id: clientID,
        cars: packageGraphics(),
        map: getMap(),
        checkpoints:current_map.checkpoints
    }
}

function changeMap(info) {
    let segments = info.map.segments;
    let checkpoints = info.map.gates;
    let startGate = info.map.startGate;
    current_map.removeMap();
    current_map = new map(segments, checkpoints, startGate);
    current_map.createMap();
    return getMap();
}

module.exports.packageGraphics = packageGraphics;
module.exports.addClient = addClient;
module.exports.addRaceCar = addRaceCar;
module.exports.updateMovement = updateMovement;
module.exports.applyMove = applyMove;
module.exports.removeUser= removeUser;
module.exports.getCarById = getCarById;
module.exports.initIO = initIO;
module.exports.changeMap = changeMap;
