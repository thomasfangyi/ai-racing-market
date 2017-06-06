/**
 * Created by Robert on 05/06/2017.
 */
const hashMap = require('hashmap');
const p2 = require('p2');
const result = new p2.RaycastResult();

class Map{
  constructor (segments, checkpoints, startGate) {
    this.segments = segments;
    this.checkpoints = checkpoints;
    this.startGate = startGate;

    this.save = JSON.parse(JSON.stringify(segments));// Required since p2 manipulates array
    this.mapPolys = [];
    this.mapCheckpoints = new hashMap.HashMap();
    this.mapStartGate;

    this.removeMap = function (world) {
      for (let i in this.mapPolys) {
        world.removeBody(this.mapPolys[i]);
      }
      this.mapCheckpoints.clear();
    };

    this.checkCheckpoints = function(world) {
      this.mapCheckpoints.forEach(function(value, ray){
        p2.vec2.copy(ray.from, value[1]);
        p2.vec2.copy(ray.to, value[2]);
        ray.update();
        result.reset();
        world.raycast(result, ray);
      });
    };

    this._createp2MapSegment = function (world, segment) {
      let p2map = new p2.Body({
        mass : 1,
        position:[0,0],
        type: p2.Body.STATIC,
      });
      p2map.fromPolygon(segment);
      world.addBody(p2map);

      /*************Blame the p2 author for bad API design **************/
      for(let i = 0; i < p2map.shapes.length; i++){
        p2map.shapes[i].collisionMask = -1;
        p2map.shapes[i].collisionGroup = Math.pow(2,31);
      }
      /*******************************************************************/
      return p2map
    }

    this.createMap = function (world) {
      // Create physical polygons
      for (let p = 0; p < this.segments.length; p++) {
        this.mapPolys.push(this._createp2MapSegment(world, this.segments[p]));
      }

      // Create checkpoint rays
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

      // Create start point ray
      this.mapStartGate = new p2.Ray({
        mode: p2.Ray.ALL,
        collisionMask:-1^Math.pow(2,31),
        callback: function(result){
          checkpointResult(result, this);
        }
      })
    }
  }
}

module.exports.Map = Map;
