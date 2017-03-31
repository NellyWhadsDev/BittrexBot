'use strict';

//Wit.ai
const WIT_URL = '';

//Bittrex
const BITTREX_URL = 'https://bittrex.com';

//Facebook Messenger
const FB_SEND_API = 'https://graph.facebook.com/v2.6/me/messages';

//Firebase
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || 'bittrexbot.firebaseapp.com';
if (!FIREBASE_AUTH_DOMAIN) {
    throw new Error('Missing FIREBASE_AUTH_DOMAIN');
}

const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://bittrexbot.firebaseio.com';
if (!FIREBASE_DATABASE_URL) {
    throw new Error('Missing FIREBASE_DATABASE_URL');
}

module.exports = {
  BITTREX_URL: BITTREX_URL,
  FB_SEND_API: FB_SEND_API,
  FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL: FIREBASE_DATABASE_URL
}