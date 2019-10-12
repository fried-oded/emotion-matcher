const _ = require('underscore');

var neutralImages = Array(100).fill("pics/A.jpg");
var sadImages    = Array(100).fill("pics/B.jpg");
var happyImages  = Array(100).fill("pics/C.jpg");

function getDummyTrials(){
    return Array(48).fill({
        picSourceA: "pics/B.jpg",
        picSourceB: "pics/C.jpg",
        category: "bla",
        correctAnswer: true
    })
}

function randomPair(list1, list2){
    //todo: prevent same person on both resuts
    return _.shuffle([list1.pop(), list2.pop()])
}

function getTrials(){
    var neutrals = _.shuffle(neutralImages)
    var sads    = _.shuffle(sadImages)
    var happies = _.shuffle(happyImages)

    var nn = Array.from(Array(6), function(){
        var pair =  randomPair(neutrals, neutrals)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "nn",
            correctAnswer: true
        }
    })

    var ns = Array.from(Array(6), function(){
        var pair =  randomPair(neutrals, sads)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "ns",
            correctAnswer: false
        }
    })

    var nh = Array.from(Array(6), function(){
        var pair =  randomPair(neutrals, happies)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "nh",
            correctAnswer: false
        }
    })

    var ss = Array.from(Array(6), function(){
        var pair =  randomPair(sads, sads)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "ss",
            correctAnswer: true
        }
    })

    var sh = Array.from(Array(6), function(){
        var pair =  randomPair(sads, happies)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "sh",
            correctAnswer: false
        }
    })

    var hh = Array.from(Array(6), function(){
        var pair =  randomPair(happies, happies)
        return {
            picSourceA: pair[0],
            picSourceB: pair[1],
            category: "hh",
            correctAnswer: true
        }
    })

    return _.shuffle([].concat(nn, ns, nh, ss, sh, hh))


}




module.exports = {
    getDummyTrials: getDummyTrials,
    getTrials: getTrials
  };