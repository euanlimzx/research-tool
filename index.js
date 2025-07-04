// Download the helper library from https://www.twilio.com/docs/node/install
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
require('dotenv').config();
const { GreenApiClient } = require('@green-api/whatsapp-api-client-js-v2');
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
//   createCall();
  // sendMessage();
  sendWhatsAppMessage();
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

// 5. Send an SMS message
// async function sendMessage(to, from, body) {
const sendMessage = async () => {
  const to = "+6588680150";
  const from = "+6582410222";
  const body = "Hello, this is a test message from Twilio!";
  try {
    const message = await client.messages.create({
      to,
      from,
      body
    });
    console.log('Message SID:', message.sid);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

// 6. Send a WhatsApp message using Green-API
async function sendWhatsAppMessage() {
  const idInstance = process.env.GREENAPI_ID_INSTANCE;
  const apiTokenInstance = process.env.GREENAPI_API_TOKEN_INSTANCE;
  const client = new GreenApiClient({
    idInstance,
    apiTokenInstance
  });
  try {
    const result = await client.sendMessage({
      chatId: '6588680150@c.us', // Replace with the actual WhatsApp number in international format + country code, e.g. 1234567890@c.us
      message: 'Hello from WhatsApp via Green-API!'
    });
    console.log('WhatsApp message sent:', result);
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}