var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var VERIFY_TOKEN = '25D5C529FA42A5391CBCD79336560D2B7F3D3DED0D2FFA30119A0A1D7540FC62';

app.set('port', process.env.PORT || 5000);

// Process application/json
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hey, I\'m a chatbot for Bittrex.');
});

app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

app.post('/webhook', function(req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
