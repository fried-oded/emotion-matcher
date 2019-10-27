const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var RESULT_HEADERS = [
    {id: 'trialNum', title: 'trialNum'},
    {id: 'picSourceA', title: 'picSourceA'},
    {id: 'picSourceB', title: 'picSourceB'},
    {id: 'category', title: 'category'},
    {id: 'correctAnswer', title: 'correctAnswer'},
    {id: 'userAnswer', title: 'userAnswer'},
    {id: 'userCorrect', title: 'userCorrect'},
    {id: 'responseTime', title: 'responseTime'}
]

var RESULTS_FOLDER = 'results/'

function saveResults(subject, results){
    var ts = Date.now() / 1000 | 0;
    var outputPath = RESULTS_FOLDER + subject + '_' + ts + '.csv'
    const csvWriter = createCsvWriter({
        'path': outputPath,
        'header': RESULT_HEADERS
      });
      
      csvWriter
        .writeRecords(results)
        .then(()=> console.log('The CSV file was written successfully to ' + outputPath));
      
}

module.exports = {
    'saveResults': saveResults
  };
