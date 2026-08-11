const twilio = require("twilio");

const createVoiceClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

const sendVoiceMessage = async ({ to, message }) => {
  const client = createVoiceClient();

  if (!client) {
    throw new Error("Twilio configuration is missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER is missing.");
  }

  const response = await client.messages.create({
    body: message,
    from,
    to,
  });

  return response;
};

module.exports = {
  createVoiceClient,
  sendVoiceMessage,
};
