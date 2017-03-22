var express = require('express');
var app = express();

var VERIFY_TOKEN = '25D5C529FA42A5391CBCD79336560D2B7F3D3DED0D2FFA30119A0A1D7540FC62';

app.set('port', process.env.PORT || 5000);

app.get('/', function (req, res) {
    res.send('Hey, I\'m a chatbot for Bittrex.');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
