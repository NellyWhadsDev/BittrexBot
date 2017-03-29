var BittrexHandler = function() {

    'use strict';

    var bittrex = require('node.bittrex.api'),
        firebase = require('firebase'),
        hasha = require('hasha');

    var firebaseOptions = {
        apiKey: "AIzaSyCN1Kgxc2POrVr2UM6QogYzxF7yQe9uyDI",
        authDomain : "bittrexbot.firebaseapp.com",
        databaseURL: "https://bittrexbot.firebaseio.com"
    };

    console.log('BittrexHandler initializing firebase');
    firebase.initializeApp(firebaseOptions);

    var getAPICredentials = function(messengerPSID, callback, error) {
        signInUser(messengerPSID, function () {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + firebaseUID).once('value', function(snapshot) {
                var apiCredentials = snapshot.val();
                if (apiCredentials.key != null && apiCredentials.secret != null)
                {
                    callback(apiCredentials);
                }
                signOutUser(firebaseUID, error(signOutError));
            }, function(databaseError) {
                console.log('BittrexHandler firebase read error for user %s: ', firebaseUID, databaseError);
                error();
            });
        }, function() {error()});
    };

    var setAPIKey = function(messengerPSID, apiKey, callback, error) {
        signInUser(messengerPSID, function() {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + firebaseUID + '/key').set(apiKey).then( function() {
                callback();
                signOutUser(firebaseUID, error(signOutError));
            } , function(databaseError) {
                console.log('BittrexHandler firebase set error for user %s: ', firebaseUID, databaseError);
                error();
            })
        } , error());

    };

    var setAPISecret = function(messengerPSID, apiSecret, callback, error) {
        signInUser(messengerPSID, function() {
            var firebaseUID = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + firebaseUID + '/secret').set(apiSecret).then( function() {
                callback();
                signOutUser(firebaseUID, error(signOutError));
            } , function(databaseError) {
                console.log('BittrexHandler firebase set error for user %s: ', firebaseUID, databaseError);
                error();
            })
        } , error());

    };

    var signInUser = function(messengerPSID, callback, error) {
        var email = messengerPSID + "@facebook.com";
        var password = hasha(messengerPSID);

        firebase.auth().signInWithEmailAndPassword(email, password).then(callback(), function(signInError) {
            console.log('BittrexHandler firebase sign in error: ', signInError);
            error();
        });
    };

    var signOutUser = function(firebaseUID, error) {
        firebase.auth().signOut().then(null, function(signOutError) {
            console.log('BittrexHandler sign out error for user %s: ', firebaseUID, signOutError);
            error();
        });
    };

    return {
        init: function(messengerPSID, callback, error) {
            getAPICredentials(messengerPSID, function(credentials) {
                console.log('BitrexHandler initializing bittrex.api with credentials: ', credentials);
                bittrex.options({
                    'apikey' : credentials.key,
                    'apisecret' : credentials.secret,
                    'verbose' :  true
                });
                callback();
            }, error());
        },
        setkey: function(messengerPSID, apiKey, callback, error) {
            setAPIKey(messengerPSID, apiKey, callback(), error());
        },
        setsecret: function(messengerPSID, spiSecret, callback, error) {
            setAPISecret(messengerPSID, apiKey, callback(), error());
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
            bittrex.buylimit(option, callback);
        },
        buymarket: function(options, callback) {
            bittrec.buymarket(options, callback);
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
