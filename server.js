const express = require('express')
var trials = require('./trails/trial-provider');

const app = express()

app.use(express.static('public'))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
  console.log('http://localhost:3000/')
});

app.get('/trials', function (req, res) {
    console.debug("trials requested")
    res.send(trials.getTrials());
});