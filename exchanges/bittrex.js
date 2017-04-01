var BittrexHandler = function() {
    'use strict';

    var Config = require('../config'),
        Constants = require('../constants'),
        bittrex = require('node.bittrex.api'),
        firebase = require('firebase'),
        hasha = require('hasha');

    console.log('BittrexHandler initializing firebase');
    firebase.initializeApp({
        apiKey: Config.FIREBASE_API_KEY,
        authDomain : Constants.FIREBASE_AUTH_DOMAIN,
        databaseURL: Constants.FIREBASE_DATABASE_URL
    });

    var getAPICredentials = function(messengerPSID, callback, error) {
        signInUser(messengerPSID, function () {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref(Constants.FIREBASE_DATABASE_USERS_SUB_URL + firebaseUID).once('value', function(snapshot) {
                var apiCredentials = snapshot.val();
                signOutUser(firebaseUID, function() {
                    if (apiCredentials != null && apiCredentials.key != null && apiCredentials.secret != null)
                    {
                        callback(apiCredentials);
                    } else {
                        console.log('BittrexHandler missing credentials for user %s', firebaseUID);
                        error()
                    };
                }, function() {error()});
            }, function(databaseError) {
                console.log('BittrexHandler firebase read error for user %s: ', firebaseUID, databaseError);
                error();
            });
        }, function() {error()});
    };

    var setAPIKey = function(messengerPSID, apiKey, callback, error) {
        signInUser(messengerPSID, function() {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref(Constants.FIREBASE_DATABASE_USERS_SUB_URL + firebaseUID + Constants.FIREBASE_DATABASE_KEY_SUB_URL).set(apiKey).then( function() {
                signOutUser(firebaseUID, function() {callback()}, function() {error()});
            }, function(databaseError) {
                console.log('BittrexHandler firebase set error for user %s: ', firebaseUID, databaseError);
                error();
            })
        }, function() {error()});
    };

    var setAPISecret = function(messengerPSID, apiSecret, callback, error) {
        signInUser(messengerPSID, function() {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref(Constants.FIREBASE_DATABASE_USERS_SUB_URL + firebaseUID + Constants.FIREBASE_DATABASE_SECRET_SUB_URL).set(apiSecret).then( function() {
                signOutUser(firebaseUID, function() {callback()}, function() {error()});
            }, function(databaseError) {
                console.log('BittrexHandler firebase set error for user %s: ', firebaseUID, databaseError);
                error();
            })
        } , function() {error()});
    };

    var signInUser = function(messengerPSID, callback, error) {
        var email = messengerPSID + "@facebook.com";
        var password = hasha(messengerPSID);

        firebase.auth().signInWithEmailAndPassword(email, password).then(function() {callback();}, function(signInError) {
            console.log('BittrexHandler firebse sign in error for messenger user %s: ', messengerPSID, signInError);
            error();
        });
    };

    var signOutUser = function(firebaseUID, callback, error) {
        firebase.auth().signOut().then(function() {
            bittrex.options({
                'apikey' : null,
                'apisecret' : null
            });
            callback();
        }, function(signOutError) {
            console.log('BittrexHandler firebase sign out error for user %s: ', firebaseUID, signOutError);
            error();
        });
    };

    return {
        init: function(messengerPSID, callback, error) {
            getAPICredentials(messengerPSID, function(credentials) {
                bittrex.options({
                    'apikey' : credentials.key,
                    'apisecret' : credentials.secret
                });
                callback();
            }, function() {error()});
        },
        setkey: function(messengerPSID, apiKey, callback, error) {
            setAPIKey(messengerPSID, apiKey, function() {callback()}, function() {error()});
        },
        setsecret: function(messengerPSID, apiSecret, callback, error) {
            setAPISecret(messengerPSID, apiSecret, function() {callback()}, function() {error()});
        },
        sendCustomRequest: function(request_string, callback, credentials) {
            bittrex.sendCustomRequest(request_string, callback, credentials);
        },
        getmarkets: function(callback) {
            bittrex.getmarkets(callback);
        },
        getcurrencies: function(callback) {
            bittrex.getcurrencies(callback);
        },
        getticker: function(options, callback) {
            bittrex.getticker(options, callback);
        },
        getmarketsummaries: function(callback) {
            bittrex.getmarketsummaries(callback);
        },
        getmarketsummary: function(options, callback) {
            bittrex.getmarketsummary(options, callback);
        },
        getorderbook: function(options, callback) {
            bittrex.getorderbook(options, callback);
        },
        getmarkethistory: function(options, callback) {
            bittrex.getmarkethistory(options, callback);
        },
        buylimit: function(options, callback) {
            bittrex.buylimit(options, callback);
        },
        buymarket: function(options, callback) {
            bittrex.buymarket(options, callback);
        },
        selllimit: function(options, callback) {
            bittrex.selllimit(options, callback);
        },
        sellmarket: function(options, callback) {
            bittrex.sellmarket(options, callback);
        },
        cancel: function(options, callback) {
            bittrex.cancel(options, callback);
        },
        getopenorders: function(options, callback) {
            bittrex.getopenorders(options, callback);
        },
        getbalances: function(callback) {
            bittrex.getbalances(callback);
        },
        getbalance: function(options, callback) {
            bittrex.getbalance(options, callback);
        },
        getwithdrawalhistory: function(options, callback) {
            bittrex.getwithdrawalhistory(options, callback);
        },
        getdepositaddress: function(options, callback) {
            bittrex.getdepositaddress(options, callback);
        },
        getdeposithistory: function(options, callback) {
            bittrex.getdeposithistory(options, callback);
        },
        getorderhistory: function(options, callback) {
            bittrex.getorderhistory(options, callback);
        },
        getorder: function(options, callback) {
            bittrex.getorder(options, callback);
        },
        withdraw: function(options, callback) {
            bittrex.withdraw(options, callback);
        }
    };
}();

module.exports = BittrexHandler;
