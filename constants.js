//Wit.ai
const WIT_URL = '';

//Bittrex
const BITTREX_URL = 'https://bittrex.com';

//Facebook Messenger
const FB_SEND_API = 'https://graph.facebook.com/v2.6/me/messages';

const FB_WEBHOOK_SUB_URL = '/facebook_webhook';

const FB_POSTBACKS = {
    BALLANCE_BUTTON_POSTBACK: 'BALANCE_BUTTON_POSTBACK'
}

//Firebase
const FIREBASE_AUTH_DOMAIN = 'bittrexbot.firebaseapp.com';

const FIREBASE_DATABASE_URL = 'https://bittrexbot.firebaseio.com';

const FIREBASE_DATABASE_USERS_SUB_URL = 'users/';

const FIREBASE_DATABASE_KEY_SUB_URL = 'key/';

const FIREBASE_DATABASE_SECRET_SUB_URL = 'secret/';

module.exports = {
  BITTREX_URL: BITTREX_URL,
  FB_SEND_API: FB_SEND_API,
  FB_WEBHOOK_SUB_URL: FB_WEBHOOK_SUB_URL,
  FB_POSTBACKS: FB_POSTBACKS,
  FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL: FIREBASE_DATABASE_URL,
  FIREBASE_DATABASE_USERS_SUB_URL: FIREBASE_DATABASE_USERS_SUB_URL,
  FIREBASE_DATABASE_KEY_SUB_URL: FIREBASE_DATABASE_KEY_SUB_URL,
  FIREBASE_DATABASE_SECRET_SUB_URL: FIREBASE_DATABASE_SECRET_SUB_URL
}