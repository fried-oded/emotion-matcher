const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var RESULT_HEADERS = [
    {id: 'trialNum', title: 'trialNum'},
    {id: 'picSourceA', title: 'picSourceA'},
    {id: 'picSourceB', title: 'picSourceB'},
    {id: 'courrectAnswer', title: 'courrectAnswer'},
    {id: 'userAnswer', title: 'userAnswer'},
    {id: 'responseTime', title: 'responseTime'}
]

var RESULTS_FOLDER = 'results/'

function saveResults(subject, results){
    const csvWriter = createCsvWriter({
        'path': RESULTS_FOLDER + subject + '.csv',
        'header': RESULT_HEADERS
      });
      
      csvWriter
        .writeRecords(results)
        .then(()=> console.log('The CSV file was written successfully'));
      
}

module.exports = {
    'saveResults': saveResults
  };
