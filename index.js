'use strict'

var bodyParser = require('body-parser')
var express = require('express')

var Config = require('./config')
var Constants = require('./constants')
var Bittrex = require('./exchanges/bittrex')
var FB = require('./providers/facebook')

var app = express()
app.set('port', process.env.PORT || 5000)
app.use(bodyParser.json())

// Home page
app.get('/', function (req, res) {
  res.redirect(Constants.BITTREX_URL)
})

// FB Page Verification
app.get(Constants.FB_WEBHOOK_SUB_URL, function (req, res) {
  if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong token')
  }
})

// FB Recieve Messages
app.post(Constants.FB_WEBHOOK_SUB_URL, function (req, res) {
  var events = FB.getEvents(req.body)

  if (events) {
    events.forEach(function (event) {
      if (event.type === Constants.FB_EVENT_TYPE.MESSAGE) {
        receivedMessage(event)
      } else if (event.type === Constants.FB_EVENT_TYPE.POSTBACK) {
        receivedPostback(event)
      }
    })
  }
  res.sendStatus(200)
})

function receivedPostback (event) {
  var senderID = event.senderID
  var timeStamp = event.timeStamp
  var payload = event.payload

  console.log('Received postback for user %d at %d with payload: \n', senderID, timeStamp, payload)

  switch (payload) {
    case Constants.FB_POSTBACKS.BALLANCE_BUTTON_POSTBACK:
      Bittrex.init(senderID, function () {
        Bittrex.getbalances(function (res) {
          if (res.success === true) {
            sendBalanceButtonMessage(senderID, res)
          } else { sendErrorMessage(senderID) }
        })
      }, function () { sendErrorMessage(senderID) })
      break
    default:
      console.log('Unknown payload in postback: ', event)
      sendErrorMessage(senderID)
  }
}

function receivedMessage (event) {
  var senderID = event.senderID
  var timeStamp = event.timeStamp
  var message = event.payload

  console.log('Received message for user %d at %d with message: \n', senderID, timeStamp, message)

  // TODO: Do this using Wit.ai
  var apiKeyTriggerMessage = 'apiKey: '
  var apiSecretTriggerMessage = 'apiSecret: '

  if (message.startsWith(apiKeyTriggerMessage)) {
    Bittrex.setkey(senderID, message.substr(apiKeyTriggerMessage.length, message.length), function () {
      sendTextMessage(senderID, 'API Key Updated!')
    }, function () { sendErrorMessage(senderID) })
  } else if (message.startsWith(apiSecretTriggerMessage)) {
    Bittrex.setsecret(senderID, message.substr(apiSecretTriggerMessage.length, message.length), function () {
      sendTextMessage(senderID, 'API Secret Updated!')
    }, function () { sendErrorMessage(senderID) })
  } else {
    sendTextMessage(senderID, 'Echo!\n' + message)
  }
}

function sendBalanceButtonMessage (recipientId, data) {
  var wallets = data.result
  var messageText = 'Wallets and available balances:'
  wallets.forEach(function (wallet) {
    messageText += '\n' + wallet.Currency + ' - ' + wallet.Available
  })
  sendTextMessage(recipientId, messageText)
}

function sendErrorMessage (recipientId) {
  sendTextMessage(recipientId, "We're sorry, something seems to have gone wrong on our end.")
}

function sendTextMessage (recipientId, messageText) {
  FB.sendTextMessage(recipientId, messageText)
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
