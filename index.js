var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var VERIFY_TOKEN = '25D5C529FA42A5391CBCD79336560D2B7F3D3DED0D2FFA30119A0A1D7540FC62';

var PAGE_ACCESS_TOKEN = 'EAAOUJqh081wBAEsZC0ShI3dFQAJITNhZAdRHu6cP26d6xHUG6ZCJZBefT9Hx4ZC1SFZB18MKbToy6b7kQuqP0UkJJA7DyDO1VhRdR0terZC5981oyUFmY5kl2UpejQLCRZBGkkEQqKzTHHDm7m4vG1RIbaf1podjaJUjLcrgwq8KlAZDZD';

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
        if (event.postback) {
          receivedPostback(event);
        } else if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d at %d with payload:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(payload));

  switch (payload) {
    case 'TEST_BUTTON':
      sendTestButtonMessage(senderID);
      break;
    
    default:
      sendErrorMessage(senderID);
      console.log("Unknown payload in postback: ", event);
  }
}
  
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId) {
  // To be expanded in later sections
}

function sendTestButtonMessage(recipientId) {
    var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "You found the test button!"
    }
  };

  callSendAPI(messageData);
}

function sendErrorMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "We're sorry, something seems to have gone wrong on our end."
    }
  }; 

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
