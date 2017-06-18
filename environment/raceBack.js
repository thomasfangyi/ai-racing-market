/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const util = require('./util');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');
const mapFS = require('./mapSave');
const datebase = require('../db');
const random = require('array-permutation').random;

// Globals
let fixedTimeStep, raceDuration, numAIinRace;
let numTutorialSteps, baseTutorial;

// Default map
let defaultMap, current_map;

// Create the simulations
let simulations;

// log io
let io;

function init(io, maxSims) {
    this.io = io;
    defaultMap = mapFS.readMap('./maps/slalem2.json');
    current_map = [defaultMap["segments"], defaultMap["gates"], defaultMap["startGate"]];

    // Globals
    fixedTimeStep = 0.06;
    raceDuration = 10;
    numAIinRace = 3;
    numTutorialSteps = 3;
    baseTutorial = 100;


    simulations = new Simulation.Simulations(maxSims);

    // This simulation is reserved for AI training mode
    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(1337, mapCopy, io, Simulation.SimMode.Training);

    // This simulation is reserved for challenges
    mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(1338, mapCopy, io, Simulation.SimMode.Training);

    for (let i = 0; i < numTutorialSteps; i++) {
        mapCopy = util.arrayCopy(current_map);
        simulations.addSimulation(baseTutorial + i + 1, mapCopy, io, Simulation.SimMode.Challenges);
    }

    // Loop the program
    setInterval(function() {
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

function addSim(id, mode, AI){
    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(id, mapCopy, this.io, mode);
    datebase.getRandomScripts(function(err,scripts){
       if (err){
           //WHAT to do here?
       } else {
            let scriptIds = random(scripts.length);
            let scriptCompete = [AI];
            for (let i = 0;i < 3;i++){
                scriptCompete.push(scripts[scriptIds[i]]._id);
            }
           simulations.addAI(id,scriptCompete);
       }
    });

}

function runTutorial(code, tutorialNumber) {
    getSim(baseTutorial + tutorialNumber).runTutorial(code, tutorialNumber);
}

module.exports.getSim = getSim;
module.exports.init = init;
module.exports.fixedTimeStep = fixedTimeStep;
module.exports.getAllSims = getAllSims;
module.exports.addSim = addSim;
module.exports.runTutorial = runTutorial;
module.exports.SimMode = Simulation.SimMode;
