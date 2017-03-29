var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var bittrexHandler = require('./bittrexHandler.js');

var PAGE_ID = '236820823391221';

var VERIFY_TOKEN = '25D5C529FA42A5391CBCD79336560D2B7F3D3DED0D2FFA30119A0A1D7540FC62';

var PAGE_ACCESS_TOKEN = 'EAAOUJqh081wBAEsZC0ShI3dFQAJITNhZAdRHu6cP26d6xHUG6ZCJZBefT9Hx4ZC1SFZB18MKbToy6b7kQuqP0UkJJA7DyDO1VhRdR0terZC5981oyUFmY5kl2UpejQLCRZBGkkEQqKzTHHDm7m4vG1RIbaf1podjaJUjLcrgwq8KlAZDZD';

app.set('port', process.env.PORT || 5000);

// Process application/json
app.use(bodyParser.json());

app.get('/', function (req, res) { res.redirect('https://bittrex.com'); });

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is our page's subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {

            if (entry.id != PAGE_ID) {
                console.log("Error, invalid page ID: ", entry.id);
                return;
            }

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.postback) { receivedPostback(event); }
                else if (event.message) { receivedMessage(event); }
                else { console.log("Webhook received unknown event: ", event); }
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

    console.log("Received postback for user %d and page %d at %d with payload: /n", senderID, recipientID, timeOfMessage, JSON.stringify(payload));

    switch (payload) {
        case 'BALANCE_BUTTON_POSTBACK':
            bittrexHandler.init(senderID, function() {  
                bittrexHandler.getbalances(function (res) {
                    if (res.success == true) {
                        sendBalanceButtonMessage(senderID, res);
                    } else {
                        console.log("API call unsuccessful: ", res);
                        sendErrorMessage(senderID);
                    }
                });
            }, function(error) {
                console.log('handlerInit error :', error);
                sendErrorMessage(senderID);
            });
            break;

        default:
            console.log("Unknown payload in postback: ", event);
            sendErrorMessage(senderID);
    }
}

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message: /n", senderID, recipientID, timeOfMessage, JSON.stringify(message));

    userLogin(senderID);

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            // Example: Handle message with exact text
            // case 'generic':
            //   sendGenericMessage(senderID);
            //   break;

            default:
                sendTextMessage(senderID, "Echo!\n" + messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendBalanceButtonMessage(recipientId, data) {
    var wallets = data.result;
    var messageText = "Wallets and available balances:";
    wallets.forEach(function (wallet) {
        messageText += "\n" + wallet.Currency + " - " + wallet.Available;
    });
    sendTextMessage(recipientId, messageText);
}

function sendErrorMessage(recipientId) {
    sendTextMessage(recipientId, "We're sorry, something seems to have gone wrong on our end.");
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: { id: recipientId },
        message: { text: messageText }
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
            // Logging unnecessary at the moment
            // console.log("Successfully sent message with id %s to recipient %s with content \"%s\"",
            //   body.message_id, body.recipient_id, messageData.message.text);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

function updateCredentials(firebaseUID) {
    firebase.database().ref('users/' + firebaseUID).set({
        key: '6fba4b689f154a1ca82a20ce79e5e8c6',
        secret: 'cd0a5fbeae38427cb3e362ef715ecf61'
    }).catch(function (error) {
        console.log(error);
    });
}

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});
