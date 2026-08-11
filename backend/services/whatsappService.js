const axios = require("axios");

const getMode = () => (process.env.WHATSAPP_MODE || "mock").toLowerCase();

const formatPhone = (value = "") => {
  const digits = `${value}`.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

const sendWhatsAppMessage = async ({ to, message, accessToken, apiVersion = "v18.0" }) => {
  const normalizedNumber = formatPhone(to);

  if (!normalizedNumber || !message) {
    throw new Error("WhatsApp recipient and message are required.");
  }

  if (getMode() === "mock") {
    console.log("[WhatsApp MOCK]");
    console.log(`To: ${normalizedNumber}`);
    console.log(`Message:\n${message}`);
    return { success: true, mode: "mock", recipient: normalizedNumber, message };
  }

  const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error("WhatsApp production configuration is missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const response = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: normalizedNumber,
      type: "text",
      text: {
        body: message,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const sendWelcomeWhatsAppMessage = async (to) => {
  return sendWhatsAppMessage({
    to,
    message: `🤖 Welcome to SwarmOS!\n\nYour AI software engineering team is ready.\n\nYou can control your projects from your laptop or WhatsApp.\n\nTry:\n• Build an attendance management system\n• What's my project status?\n• Add student search\n• Show my architecture\n• Run a security scan\n• Generate documentation\n\nSwarmOS is ready 🚀`,
  });
};

module.exports = {
  sendWhatsAppMessage,
  sendWelcomeWhatsAppMessage,
  getMode,
};
