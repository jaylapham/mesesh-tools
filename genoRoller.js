// make sure you "npm install --save lodash random-weighted-choice" before you run this
// you can also use/create a batch file with "node genoRoller.js | clip" on windows to automatically dump the result into your clipboard

const _ = require('lodash');
const rwc = require('random-weighted-choice');

/////////////////////////
// begin data section  //
/////////////////////////
const sexOptions = ["Male", "Female"];
const baseCoatOptions = [{"Sandstone": 0.47, "code":"Ss"}, {"Chestnut": 0.26, "code":"Ch"}, {"Canyon": 0.16, "code":"Ca"}, {"Onyx": 0.06, "code":"On"}, {"Ivory": 0.04, "code":"Iv"}, {"Crystal": 0.01, "code":"Cr"}];
const geneRarityMatrix = [{"Common": 0.50, "code": "c"}, {"Uncommon": 0.30, "code": "u"}, {"Rare": 0.15, "code": "r"}, {"Exotic": 0.05, "code": "e"}];
const commonGenes = [{"name": "Capelet", "code": "cl"}, {"name": "Ink Pot", "code": "ip"}, {"name": "Lion Spots", "code": "ls"}, {"name": "Pangare", "code": "pg"}, {"name": "Ringed", "code": "rn"}, {"name": "Sable", "code": "sb"}, {"name": "Saddle", "code": "sa"}, {"name": "Sandstorm", "code": "sm"}, {"name": "Shaded", "code": "sd"}, {"name": "Shadow", "code": "sh"}, {"name": "Socks", "code": "sk"}, {"name": "Spotted", "code": "sp"}, {"name": "Ticked", "code": "ti"}, {"name": "Underbelly", "code": "un"}, {"name": "Paled", "code": "pl"}, {"name": "Okapi", "code": "ok"}, {"name": "Dun", "code": "dn"}, {"name": "Shroud", "code": "shr"}];
const uncommonGenes = [{"name": "Agouti", "code": "ag"}, {"name": "Baja", "code": "ba"}, {"name": "Blotched", "code": "bd"}, {"name": "Fog", "code": "fg"}, {"name": "Margay", "code": "mg"}, {"name": "Striped", "code": "st"}, {"name": "Tiger", "code": "tg"}, {"name": "Vitiligo", "code": "vt"}, {"name": "Wolverine", "code": "wv"}, {"name": "Veined", "code": "vn"}, {"name": "Panda", "code": "pn"}, {"name": "Two-Toned", "code": "tt"}];
const rareGenes = [{"name": "Fractal", "code": "fr"}, {"name": "Leucism", "code": "lu"}, {"name": "Magister", "code": "ma"}, {"name": "Night Sky", "code": "ns"}, {"name": "Pinto", "code": "pt"}, {"name": "Roan", "code": "ro"}, {"name": "Serpente", "code": "se"}, {"name": "Stalactite", "code": "sc"}, {"name": "Stalagmite", "code": "sg"}, {"name": "Circuit Board", "code": "cb"}, {"name": "Bioluminescence", "code": "bio"}, {"name": "Cast", "code": "ca"}];
const exoticGenes = [{"name": "Albinism", "code": "al"}, {"name": "Erythrism", "code": "er"}, {"name": "Nebula", "code": "nb"}, {"name": "Oily", "code": "ol"}, {"name": "Opal", "code": "op"}, {"name": "Tropical", "code": "tr"}];
const hereditaryMutationOptions = [{"none": 0.92, "code": ""}, {"Uroderma": 0.03, "code": ""}, {"Finned": 0.03, "code": ""}, {"Elven": 0.01, "code": ""}, {"Spired": 0.01, "code": ""}];
const nonHereditaryMutationOptions = [{"none": 0.96, "code": ""}, {"Smile": 0.02, "code": ""}, {"Winged": 0.02, "code": ""}];
const abilityOptions = [{"none": 0.85, "code": ""}, {"Sharp Senses": 0.03, "code": ""}, {"Sharp Senses": 0.03, "code": ""}, {"Seal Skin": 0.03, "code": ""}, {"Second Stomach": 0.03, "code": ""}, {"Silent Slayer": 0.03, "code": ""}];
/////////////////////////
//  end data section   //
/////////////////////////

/////////////////////////
// begin logic section //
/////////////////////////
// takes array of objects like [{"none": 0.98, "code":""}, {"Uroderma": 0.01, "code":"U"}, {"Finned": 0.01, "code":"F"}], or [{"none": 0.98}, {"Uroderma": 0.01}, {"Finned": 0.01}]
// returns the object {"name": "Blah", "code":"bl"}
const getWeightedRandomResult = function(options) {
    var rwcArray = [];
    for (var i = 0; i < options.length; i++) {
        var key = Object.keys(options[i])[0];
        rwcArray.push({"id": key, "weight": Math.floor(100 * options[i][key])});
    }
    var result = rwc(rwcArray);
    if (Object.keys(options[0]).length > 1) {
        result = _.find(options, function (option) { var nameKey = Object.keys(option)[0]; return result === nameKey; });
        // hacky as fuck
        result = {"name": Object.keys(result)[0], "code": result.code };
    } else {
        result = {"name":result, "code":null};
    }
    return result;
};

// takes array of strings like [{"name":"white", "code":"w"}, {"name":"black", "code":"b"}, {"name":"red", "code":"r"}]
// returns the object {"name": "Blah", "code":"bl"}
const getEqualRandomResult = function(options) {
    return _.sample(options);
};

const isValidGenotype = function (genotype) {
    return /^(\w{2}|\w{2}\W\/\/\W(\w{2}\/|\w{2}|\w{3}\/|\w{3})*)$/.test(genotype);
};

const generateAvlet = function() {
    var avlet = {sex:null, baseCoat:null, genes:[], rarestGene: null, hereditaryMutation:null, nonHereditaryMutation:null, ability:null};
    avlet.sex = getEqualRandomResult(sexOptions);
    avlet.baseCoat = getWeightedRandomResult(baseCoatOptions);

    var numGenes = _.sample([2, 3, 4, 5]);
    _.times(numGenes, function() {
        var rarity = getWeightedRandomResult(geneRarityMatrix).name;
        switch (rarity) {
            case "Common":
                if (avlet.rarestGene === null) {
                    avlet.rarestGene = "Common";
                }
                avlet = addGene(avlet, commonGenes);
                break;
            case "Uncommon":
                if (avlet.rarestGene !== "Exotic" && avlet.rarestGene !== "Rare") {
                    avlet.rarestGene = "Uncommon";
                }
                avlet = addGene(avlet, uncommonGenes);
                break;
            case "Rare":
                if (avlet.rarestGene !== "Exotic") {
                    avlet.rarestGene = "Rare";
                }
                avlet = addGene(avlet, rareGenes);
                break;
            case "Exotic":
                avlet.rarestGene = "Exotic";
                avlet = addGene(avlet, exoticGenes);
                break;
        }
    });

    avlet.hereditaryMutation = getWeightedRandomResult(hereditaryMutationOptions);
    avlet.nonHereditaryMutation = getWeightedRandomResult(nonHereditaryMutationOptions);
    avlet.ability = getWeightedRandomResult(abilityOptions);

    return avlet;
};

// prevents duplicate genes
const addGene = function (avlet, geneArray) {
    var genes = avlet.genes;
    var addedAGene = false;

    while (!addedAGene) {
        var gene = getEqualRandomResult(geneArray);
        var isDuplicate = (_.find(genes, gene) !== undefined);
        if (!isDuplicate) {
            genes.push(gene);
            addedAGene = true;
        }
    }

    avlet.genes = genes;
    return avlet;
};

const getGenotypeString = function (avlet) {
    var string = "";
    string += avlet.baseCoat.code + " // ";
    _.each(avlet.genes, function (gene) {
        string += gene.code + "/"
    });
    string = string.substring(0, string.length - 1);
    return string;
};


const getPhenotypeString = function (avlet) {
    var string = avlet.baseCoat.name + " with " + avlet.genes[0].name;
    for (var i = 1; i < avlet.genes.length; i++) {
        if (i === avlet.genes.length-1) {
            string += ", and " + avlet.genes[i].name;
        } else {
            string += ", " + avlet.genes[i].name;
        }
    }
    return string;
};

const printAvlet = function(avlet) {
    var genotypeString = getGenotypeString(avlet);
    var phenotypeString = getPhenotypeString(avlet);
    if (isValidGenotype(genotypeString)) {
        console.log(avlet.rarestGene + " - " + avlet.sex);
        console.log("Geno: " + genotypeString);
        console.log("Pheno: " + phenotypeString);
        var mutationString = "";
        if (avlet.hereditaryMutation.name !== "none") {
            mutationString += avlet.hereditaryMutation.name;
        }
        if (avlet.nonHereditaryMutation.name !== "none") {
            if (mutationString === "") {
                mutationString += avlet.nonHereditaryMutation.name;
            } else {
                mutationString = ", " + avlet.nonHereditaryMutation.name;
            }
        }
        if (mutationString !== "") {
            console.log("Mutation: " + mutationString);
        }
        if (avlet.ability.name !== "none") {
            console.log("Ability: " + avlet.ability.name);
        }
    } else {
        console.log("something went wrong with the generator! genotype appears invalid: " + getGenotypeString(avlet));
    }
};
/////////////////////////
//  end logic section  //
/////////////////////////

// run
printAvlet(generateAvlet());