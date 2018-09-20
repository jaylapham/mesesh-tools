const async = require('async');
const _ = require('lodash');
const rwc = require('random-weighted-choice');
const readline = require('readline');
const reader = readline.createInterface({ input: process.stdin, output: process.stdout });

const getEqualRandomResult = function(options) {
    return _.sample(options);
};

const mainMenu = function () {
    reader.question("Choose a function:\r\n 1) Activity\r\n 2) Sparring\r\n 3) Crafting\r\n anything else) exit\r\n", (input) => {
        if (input === "1") {
            activityRoll(null);
        } else if (input === "2") {
            sparringRoll(null);
        } else if (input === "3") {
            craftingRoller(null);
        } else {
            terminate();
        }
    });
};

const activityRollerInitializer = function () {
    
};

const activityRoller = function(retryObj) {
    if (retryObj === null) {
        // setup questions
        activityRollerInitializer();
    }

    // normal rolling
    

    retryPrompt(0, retryObj);
};

const sparringRollerInitializer = function () {
    
};

const sparringRoller = function(retryObj) {
    if (retryObj === null) {
        // setup questions
        sparringRollerInitializer();
    }

    // normal rolling
    

    retryPrompt(1, retryObj);
};

const craftingRollerInitializer = function () {
    
};

const craftingRoller = function(retryObj) {
    if (retryObj === null) {
        // setup questions
        craftingRollerInitializer();
    }

    // normal rolling
    

    retryPrompt(2, retryObj);
};

const retryFuncs = [activityRoller, sparringRoller, craftingRoller]; // haha

const retryPrompt = function(funcId, retryObj) {
    reader.question("Would you like to:\r\n 1) roll this again\r\n 2) restart this function\r\n\ 3) return to menu\r\n 4) exit\r\n", (input) => {
        if (input === "1") {
            // oh shit we don't have the data
        } else if (input === "2") {
            retryFuncs[funcId](retryObj); // end haha
        } else if (input === "3") {
            mainMenu();
        } else if (input === "4") {
            terminate();
        }
    });
};

const terminate = function() {
    reader.close();
};

mainMenu();