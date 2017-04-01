'use strict'

var request = require('request')
var Config = require('../config')
var Constants = require('../constants')

var getEvents = function (body) {
  if (!body.object || body.object !== 'page') {
    return null
  }

  var events = []

  if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
    body.entry.forEach(function (entry) {
      if (entry.id && entry.id !== Config.FB_PAGE_ID) {
        console.log('Error, invalid page ID: ', entry.id)
      } else if (entry.messaging && Array.isArray(entry.messaging) && entry.messaging.length > 0) {
        entry.messaging.forEach(function (event) {
          var newEvent = {
            type: Constants.FB_EVENT_TYPE.EMPTY,
            senderID: event.sender.id,
            timeStamp: event.timestamp,
            payload: null
          }

          if (event.postback && event.postback.payload) {
            newEvent.type = Constants.FB_EVENT_TYPE.POSTBACK
            newEvent.payload = event.postback.payload
          } else if (event.message && event.message.text && event.message.text.length > 0) {
            newEvent.type = Constants.FB_EVENT_TYPE.MESSAGE
            newEvent.payload = event.message.text
          }
          events.push(newEvent)
        })
      }
    })
  }
  return events
}

var sendTextMessage = function (recipientID, messageText) {
  callSendAPI({
    recipient: { id: recipientID },
    message: { text: messageText }
  })
}

var callSendAPI = function (payload) {
  request({
    uri: Constants.FB_SEND_API,
    qs: { access_token: Config.FB_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: payload
  }, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('Unable to send message.')
      console.error(response)
      console.error(error)
    }
  })
}

module.exports = {
  getEvents: getEvents,
  sendTextMessage: sendTextMessage
}
