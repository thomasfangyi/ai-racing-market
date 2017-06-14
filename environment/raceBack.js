/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const util = require('./util');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');
const mapFS = require('./mapSave');

// Globals
let fixedTimeStep, raceDuration, numAIinRace;

// Default map
let defaultMap, current_map;

// Create the simulations
let simulations;

function init(io, maxSims) {
    defaultMap = mapFS.readMap('./maps/slalem2.json');
    current_map = [defaultMap["segments"], defaultMap["gates"], defaultMap["startGate"]];

    // Globals
    fixedTimeStep = 0.06;
    raceDuration = 10;
    numAIinRace = 3;

    simulations = new Simulation.Simulations(maxSims);
    for (let i = 0; i < maxSims; i++) {
        let mapCopy = util.arrayCopy(current_map);
        simulations.addSimulation(i, mapCopy, io);
    }
    // simulations.get(9).mode = Simulation.SimMode.RankedRacing;
<<<<<<< HEAD
    simulations.get(8).train('59417fc8eb644f0011582ed4');
=======
    simulations.get(maxSims-1).train('594176155bdf7e0011b0f852');
>>>>>>> 756b91f52f7e7198582e6bc2ce193bf753eb9093

    // Loop the program
    setInterval(function() {
        simulations.runNewRaces(raceDuration, numAIinRace);
        simulations.stepAll(fixedTimeStep);
        simulations.checkCheckpoints();
        // current_map.checkCheckpoints();

        // Update graphics
        simulations.updateGraphics();
    }, 1000/30);
}

function getSim(simID) {
    return simulations.get(simID);
}

function getAllSims(){
    return simulations.currentSims();
}

module.exports.getSim = getSim;
module.exports.init = init;
module.exports.fixedTimeStep = fixedTimeStep;
module.exports.getAllSims = getAllSims;
