require('use-strict');

var Config = require('./config');
var Constants = require('./constants');
var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var bittrex = require('./exchanges/bittrex');

app.set('port', process.env.PORT || 5000);

// Process application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.redirect(Constants.BITTREX_URL);
});

app.get(Constants.FB_WEBHOOK_SUB_URL, function (req, res) {
    if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post(Constants.FB_WEBHOOK_SUB_URL, function (req, res) {
    var data = req.body;

    // Make sure this is our page's subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {

            if (entry.id != Config.FB_PAGE_ID) {
                console.log('Error, invalid page ID: ', entry.id);
                return;
            }

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.postback) { receivedPostback(event); }
                else if (event.message) { receivedMessage(event); }
                else { 
                    console.log('Webhook received unknown event: ', event); 
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

    console.log('Received postback for user %d and page %d at %d with payload: \n', senderID, recipientID, timeOfMessage, JSON.stringify(payload));

    switch (payload) {
        case Constants.FB_POSTBACKS.BALLANCE_BUTTON_POSTBACK:
            bittrex.init(senderID, function() {  
                bittrex.getbalances(function (res) {
                    if (res.success == true) {
                        sendBalanceButtonMessage(senderID, res);
                    } else {sendErrorMessage(senderID)}
                });
            }, function() {sendErrorMessage(senderID)});
            break;
        default:
            console.log('Unknown payload in postback: ', event);
            sendErrorMessage(senderID);
    }
}

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log('Received message for user %d and page %d at %d with message: \n', senderID, recipientID, timeOfMessage, JSON.stringify(message));

    var messageText = message.text;
    //TODO: Do this using Wit.ai
    var apiKeyTriggerMessage = 'apiKey: ';
    var apiSecretTriggerMessage = 'apiSecret: ';
    if (messageText) {
        if(messageText.startsWith(apiKeyTriggerMessage)) {
            bittrex.setkey(senderID, messageText.substr(apiKeyTriggerMessage.length, messageText.length), function() {
                sendTextMessage(senderID, 'API Key Updated!');
            }, function() {sendErrorMessage(senderID)});
        } else if(messageText.startsWith(apiSecretTriggerMessage)) {
            bittrex.setsecret(senderID, messageText.substr(apiSecretTriggerMessage.length, messageText.length), function() {
                sendTextMessage(senderID, 'API Secret Updated!')
            }, function() {sendErrorMessage(senderID)});
        } else {
            sendTextMessage(senderID, 'Echo!\n' + messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, 'Message with attachment received');
    }
}

function sendBalanceButtonMessage(recipientId, data) {
    var wallets = data.result;
    var messageText = 'Wallets and available balances:';
    wallets.forEach(function (wallet) {
        messageText += '\n' + wallet.Currency + ' - ' + wallet.Available;
    });
    sendTextMessage(recipientId, messageText);
}

function sendErrorMessage(recipientId) {
    sendTextMessage(recipientId, 'We\'re sorry, something seems to have gone wrong on our end.');
}

function sendTextMessage(recipientId, messageText) {
    callSendAPI({
        recipient: { id: recipientId },
        message: { text: messageText }
    });
}

function callSendAPI(messageData) {
    request({
        uri: Constants.FB_SEND_API,
        qs: { access_token: Config.FB_PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData
    }, function (error, response, body) {
        if (error || response.statusCode != 200) {
            console.error('Unable to send message.');
            console.error(response);
            console.error(error);
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});
