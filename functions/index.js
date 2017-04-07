'use strict'

var diff = require('deep-diff').diff
var functions = require('firebase-functions')
var admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.sendNewMarketNotification = functions.database.ref('/markets').onWrite(event => {
  if (event.data.previous.numChildren() !== event.data.numChildren()) {
    var differences = diff(event.data.previous.val(), event.data.current.val())

    console.log('Difference in markets: ', JSON.stringify(differences))

    differences.forEach(function (difference) {
      if (difference.kind === 'N') {
        console.log('New market: ', difference.path[0])

        var payload = {
          data: {
            marketName: difference.path[0]
          }
        }

        return admin.messaging().sendToTopic('new-markets', payload).then(function (response) {
          console.log('Sent message: ', response)
        }).catch(function (error) {
          console.log('Error sending message: ', error)
        })
      }
    })
  }
})
