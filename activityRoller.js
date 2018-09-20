const async = require('async');
const _ = require('lodash');
const rwc = require('random-weighted-choice');
const readline = require('readline');
const reader = readline.createInterface({ input: process.stdin, output: process.stdout });

const getEqualRandomResult = function(options) {
    return _.sample(options);
};

// TODO refactor this semi-duplicate thing into a shared file and don't call it with two input formats, make two functions, dummy
// takes e.g. [{"none": 0.98}, {"Uroderma": 0.01}, {"Finned": 0.01}]
const getWeightedRandomResult = function(options) {
    var rwcArray = [];
    for (var i = 0; i < options.length; i++) {
        var key = Object.keys(options[i])[0];
        rwcArray.push({"id": key, "weight": Math.floor(100 * options[i][key])});
    }
    return rwc(rwcArray);
};

const mainMenu = function () {
    reader.question("Choose a function:\r\n 1) Activity\r\n 2) Sparring\r\n 3) Crafting\r\n anything else) exit\r\n> ", (input) => {
        if (input === "1") {
            activityRoller(null);
        } else if (input === "2") {
            sparringRoller(null);
        } else if (input === "3") {
            craftingRoller(null);
        } else {
            terminate();
        }
    });
};

const activityRollerInitializer = function () {
    var retryObj = {rank: 1, hasAbility: false, hasProfession: false};
    async.series([(callback) => {
            reader.question(`What is Avlet's standing?\r\n 1) Nameless\r\n 2) Vagrant\r\n 3) Pledgeless\r\n 4) Bloodsworn\r\n> `, function(args) {
                retryObj.rank = parseInt(args);
                callback();
            })
        }, (callback) => {
            reader.question(`Does the Avlet possess:\r\n 1) both an activity ability and profession\r\n 2) an activity ability\r\n 3) an activity profession\r\n 4) neither\r\n> `, function(args) {
                if (args === "1") {
                    retryObj.hasAbility = true;
                    retryObj.hasProfession = true;
                } else if (args === "2") {
                    retryObj.hasAbility = true;
                } else if (args === "3") {
                    retryObj.hasProfession = true;
                }
                callback();
            })
        }], () => {
            activityRoller(retryObj);
        });
};

const activityRoller = function(retryObj) {
    if (retryObj === null) {
        activityRollerInitializer();
    } else {
        var chanceArray = [50, 70, 85, 100];
        if (d100() <= chanceArray[retryObj.rank-1]) {
            var itemsFound = _.sample([1,2,3,4]);
            if (retryObj.hasAbility && d100() <= 25) {
                itemsFound = itemsFound + 1;
            }
            var items = [];
            for (var i = 0; i < itemsFound; i++) {
                if (retryObj.hasProfession) {
                    items.push(getWeightedRandomResult([{"Common": 0.475}, {"Uncommon": 0.325}, {"Rare": 0.2}]));
                } else {
                    items.push(getWeightedRandomResult([{"Common": 0.5}, {"Uncommon": 0.35}, {"Rare": 0.15}]));
                }
            }
            console.log(`Success! Found ${itemsFound} items: ${JSON.stringify(items)}`);
        } else {
            console.log("Failed! Gain a junk item, loser.");
        }

        retryPrompt(0, retryObj);
    }
};

const sparringRollerInitializer = function () {
    var retryObj = {avletOne: {name: "", rank: 1, boost: 0}, avletTwo: {name: "", rank: 1, boost: 0}};
    async.series([(callback) => {
            reader.question('What is the first Avlet\'s name?\r\n> ', function(args) {
                retryObj.avletOne.name = args;
                callback();
            })
        }, (callback) => {
            reader.question(`What is ${retryObj.avletOne.name}'s standing?\r\n 1) Nameless\r\n 2) Vagrant\r\n 3) Pledgeless\r\n 4) Bloodsworn\r\n> `, function(args) {
                retryObj.avletOne.rank = parseInt(args);
                callback();
            })
        }, (callback) => {
            reader.question(`Does ${retryObj.avletOne.name} possess:\r\n 1) both a sparring profession and ability\r\n 2) either a sparring profession xor ability\r\n 3) neither\r\n> `, function(args) {
                if (args === "1") {
                    retryObj.avletOne.boost = 2;
                } else if (args === "2") {
                    retryObj.avletOne.boost = 1;
                }
                callback();
            })
        }, (callback) => {
            reader.question('What is the second Avlet\'s name?\r\n> ', function(args) {
                retryObj.avletTwo.name = args;
                callback();
            })
        }, (callback) => {
            reader.question(`What is ${retryObj.avletTwo.name}'s standing?\r\n 1) Nameless\r\n 2) Vagrant\r\n 3) Pledgeless\r\n 4) Bloodsworn\r\n> `, function(args) {
                retryObj.avletTwo.rank = parseInt(args);
                callback();
            })
        }, (callback) => {
            reader.question(`Does ${retryObj.avletTwo.name} possess:\r\n 1) both a sparring profession and ability\r\n 2) either a sparring profession xor ability\r\n 3) neither\r\n> `, function(args) {
                if (args === "1") {
                    retryObj.avletTwo.boost = 2;
                } else if (args === "2") {
                    retryObj.avletTwo.boost = 1;
                }
                callback();
            })
        }], () => {
            sparringRoller(retryObj);
        });
};

const sparringRoller = function(retryObj) {
    if (retryObj === null) {
        sparringRollerInitializer();
    } else {
        console.log(`${retryObj.avletOne.name} is fighting ${retryObj.avletTwo.name}!`);
        var firstAvletChance = Math.floor((0.05 * retryObj.avletOne.rank + 0.05 * retryObj.avletOne.boost) * 100);
        var secondAvletChance = Math.floor((0.05 * retryObj.avletTwo.rank + 0.05 * retryObj.avletTwo.boost) * 100);
        console.log(`${retryObj.avletOne.name} needs to roll ${firstAvletChance} or less to injure, ${retryObj.avletTwo.name} must roll ${secondAvletChance} or less`);
        var victor = null;
        while (victor === null) {
            var firstAvletFirst = d100() > 50; // even chance to go first
            var firstAvletRoll = d100();
            var secondAvletRoll = d100();
            var firstAvletStrike = firstAvletRoll <= firstAvletChance;
            var secondAvletStrike = secondAvletRoll <= secondAvletChance;
            if (firstAvletFirst) {
                console.log(`${retryObj.avletOne.name} attacks firsts, rolls ${firstAvletRoll}, and ${firstAvletStrike ? "lands an injury!" : "misses!"}`);
                if (firstAvletStrike) { 
                    victor = retryObj.avletOne.name;
                    break;
                } else {
                    console.log(`${retryObj.avletTwo.name} strikes back, rolls ${secondAvletRoll}, and ${secondAvletStrike ? "lands an injury!" : "misses!"}`);
                    if (secondAvletStrike) {
                        victor = retryObj.avletTwo.name;
                    }
                }
            } else {
                console.log(`${retryObj.avletTwo.name} attacks first, rolls ${secondAvletRoll}, and ${secondAvletStrike ? "lands an injury!" : "misses!"}`);
                if (secondAvletStrike) { 
                    victor = retryObj.avletTwo.name;
                    break;
                } else {
                    console.log(`${retryObj.avletOne.name} strikes back, rolls ${firstAvletRoll}, and ${firstAvletStrike ? "lands an injury!" : "misses!"}`);
                    if (firstAvletStrike) {
                        victor = retryObj.avletOne.name;
                    }
                }
            }
        }
        console.log(`${victor} has triumphed!`);

        retryPrompt(1, retryObj);
    }
};

const craftingRollerInitializer = function () {
    var retryObj = {hasProfession: false};
    async.series([(callback) => {
            reader.question('Does Avlet possess a crafting profession?\r\n 1) yes\r\n 2) no\r\n> ', function(args) {
                retryObj.hasProfession = args === "1";
                callback();
            })
        }], () => {
            craftingRoller(retryObj);
        });
};

const craftingRoller = function(retryObj) {
    if (retryObj === null) {
        retryObj = craftingRollerInitializer();
    } else {
        var chance = 50;
        if (retryObj.hasProfession) {
            chance = 75;
        }

        var success = d100() <= chance;
        if (success) {
            console.log("Crafting succeeded!");
        } else {
            console.log("Crafting failed! " + _.sample([1,2]) + " items broke! Gain a junk item, loser.");
        }

        retryPrompt(2, retryObj);
    }
};

const d100 = function() {
    return Math.ceil(Math.random() * 100);
};

const retryFuncs = [activityRoller, sparringRoller, craftingRoller]; // haha

const retryPrompt = function(funcId, retryObj) {
    reader.question("Would you like to:\r\n 1) roll this again\r\n 2) restart this function\r\n\ 3) return to menu\r\n anything else) exit\r\n> ", (input) => {
        if (input === "1") {
            retryFuncs[funcId](retryObj); // also haha
        } else if (input === "2") { 
            retryFuncs[funcId](null); // end haha
        } else if (input === "3") {
            mainMenu();
        } else {
            terminate();
        }
    });
};

const terminate = function() {
    reader.close();
};

mainMenu();