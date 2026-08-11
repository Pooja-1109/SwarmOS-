const crypto = require("crypto");

const getSignatureValue = (headers = {}, candidates = []) => {
  for (const candidate of candidates) {
    const value = headers[candidate] || headers[candidate.toLowerCase()];
    if (value) return value;
  }
  return "";
};

const verifySignature = ({ headers = {}, rawBody = "", provider = "whatsapp" }) => {
  const secret = provider === "whatsapp" ? process.env.WHATSAPP_WEBHOOK_SECRET : process.env.VOICE_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  const candidates =
    provider === "whatsapp"
      ? ["x-whatsapp-signature", "x-hub-signature-256", "x-signature"]
      : ["x-voice-signature", "x-twilio-signature", "x-signature"];

  const signature = getSignatureValue(headers, candidates);
  if (!signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const normalized = signature.startsWith("sha256=") ? signature.replace("sha256=", "") : signature;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(normalized, "hex")
  );
};

module.exports = {
  verifySignature,
};
