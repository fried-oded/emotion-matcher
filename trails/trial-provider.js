const _ = require('underscore');
var fs = require('fs');

var PUBLIC_PICS_FOLDER = 'public/'
function prepareImages(subdir){
    return _.shuffle(fs.readdirSync(PUBLIC_PICS_FOLDER + subdir).map(picName => {
        return {
            picSource: subdir + picName,
            personId: picName.split('_')[0]
        }
    }))
}

function randomPair(list1, list2){
    //preventing same person in pair 
    //(assuming person apears only once in each list)
    //(also assuming this is not the last item in the list. 
    // this can be achieved by taking the same emption pairs last)
    var picA = list1.pop();
    var picB = list2.pop();
    if(picA.personId == picB.personId){
        var tmp = picA;
        picA = list1.pop();
        list1.push(tmp)
    }

    return _.shuffle([picA, picB])
}

function popPairs(num, list1, list2, category, correctAnswer){
    return Array.from(Array(num), function(){
        var pair =  randomPair(list1, list2)
        return {
            picSourceA: pair[0].picSource,
            picSourceB: pair[1].picSource,
            category: category,
            correctAnswer: correctAnswer
        }
    })
}

function getTrials(){
    var kdefHappy   = prepareImages('pics/kdef/happy/')
    var kdefNeutral = prepareImages('pics/kdef/neutral/')
    var kdefSad     = prepareImages('pics/kdef/sad/')

    var minstimHappy = prepareImages('pics/minstim/happy/')
    var minstimSad   = prepareImages('pics/minstim/sad/')

    return _.shuffle([].concat(
        popPairs(8, kdefNeutral,  kdefSad,      'NS', false),
        popPairs(8, kdefNeutral,  kdefHappy,    'NH', false),
        popPairs(4, kdefHappy,    kdefSad,      'HS', false),
        popPairs(4, minstimHappy, minstimSad,   'HS', false),
        popPairs(8, kdefNeutral,  kdefNeutral,  'NN', true),
        popPairs(6, minstimHappy, minstimHappy, 'HH', true),
        popPairs(2, kdefHappy,    kdefHappy,    'HH', true),
        popPairs(2, kdefSad,      kdefSad,      'SS', true),
        popPairs(6, minstimSad,   minstimSad,   'SS', true),
        ))
}

module.exports = {
    getTrials: getTrials
  };