// Download the helper library from https://www.twilio.com/docs/node/install
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
require('dotenv').config();
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// 1. Webhook to provide IVR prompt
app.post('/ivr', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.gather({
    numDigits: 2,
    action: '/gather',
    method: 'POST'
  }).say('Welcome! Please press a number from 1 to 10.');
  res.type('text/xml');
  res.send(twiml.toString());
});

// 2. Webhook to handle user input
app.post('/gather', (req, res) => {
  const digits = req.body.Digits;
  console.log('User pressed:', digits);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(`You pressed ${digits}. Goodbye!`);
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
});

// 3. Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  createCall();
});

// 4. Make the outbound call
async function createCall() {
  const call = await client.calls.create({
    from: "+6531052522",
    to: "+6588680150",
    url: "https://improved-tiger-instantly.ngrok-free.app/ivr", // Replace with your public ngrok URL
  });
  console.log('Call SID:', call.sid);
}