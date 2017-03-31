//Wit.ai
const WIT_TOKEN = process.env.WIT_TOKEN = '';
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN');
}

//Facebook Messenger
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
    throw new Error('Missing FB_PAGE_ID');
}

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
if (!FB_PAGE_ACCESS_TOKEN) {
    throw new Error('Missing FB_PAGE_ACCESS_TOKEN');
}

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
if (!FB_VERIFY_TOKEN) {
    throw new Error('Missing FB_VERIFY_TOKEN');
}

//Firebase
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
if (!FIREBASE_API_KEY) {
    throw new Error('Missing FIREBASE_API_KEY');
}

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_ID: FB_PAGE_ID,
  FB_PAGE_ACCESS_TOKEN: FB_PAGE_ACCESS_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  FIREBASE_API_KEY: FIREBASE_API_KEY
}