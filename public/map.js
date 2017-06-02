function Segment(path) {
  this.path = path;
  this.pixiPath = flatten_map(this.path);
  this.segment_graphic = new PIXI.Graphics();
  this.PIXIpolygon = new PIXI.Polygon(this.pixiPath)

  this.contains = function(point) {
    return this.PIXIpolygon.contains(point);
  }

  // Draw this segment of the map onto the container
  this.drawSegment = function(container, wall_colour) {
    this.segment_graphic.beginFill(wall_colour, 0.15);
    this.segment_graphic.lineStyle(0.01, wall_colour, 1);
    this.segment_graphic.drawPolygon(this.pixiPath);
    container.addChild(this.segment_graphic);
  }
}

function Gate(start, end) {
  this.startPoint = start;
  this.endPoint = end;
}

function Map(segments=[], gates=[], startGate=null) {
  this.segments = segments;
  this.gates = gates;
  this.startGate = startGate;

  this.addSegment = function(segment) {
    this.segments.push(segment);
  }

  this.addGate = function(gate) {
    this.gates.push(gate);
  }

  this.setStartGate = function(startGate) {
    this.startGate = startGate;
  }

  // Return all polygons in PIXI format
  this.getAllPolygons = function() {
    polygons = []
    for (var i = 0; i < this.segments.length; i++) {
      polygons.push(this.segments[i].pixiPath);
    }
    return polygons;
  }
}