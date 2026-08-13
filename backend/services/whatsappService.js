const axios = require("axios");

const getMode = () => (process.env.WHATSAPP_MODE || "mock").toLowerCase();

const formatPhone = (value = "") => {
  const digits = `${value}`.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

const sendWhatsAppMessage = async ({ to, message, accessToken, apiVersion = "v18.0" }) => {
  const normalizedNumber = formatPhone(to);
  const digitsOnly = normalizedNumber.replace("+", "");

  if (!normalizedNumber || !message) {
    throw new Error("WhatsApp recipient phone number and message body are required.");
  }

  const mode = getMode();

  if (mode === "mock") {
    console.log("==========================================");
    console.log("[SwarmOS WhatsApp Service - MOCK MODE]");
    console.log(`To: ${normalizedNumber}`);
    console.log(`Message:\n${message}`);
    console.log("==========================================");
    return { success: true, mode: "mock", recipient: normalizedNumber, message };
  }

  // Real Mode Execution
  const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp production credentials missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in environment variables."
    );
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digitsOnly,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      mode: "real",
      recipient: normalizedNumber,
      metaResponse: response.data,
    };
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("[WhatsApp Cloud API Error]:", errorDetails);
    throw new Error(`WhatsApp Meta API Delivery Failed: ${errorDetails}`);
  }
};

const sendWelcomeWhatsAppMessage = async (to) => {
  return sendWhatsAppMessage({
    to,
    message: `🤖 Welcome to SwarmOS!\n\nYour AI software engineering swarm is ready.\n\nYou can control your projects from your laptop or directly through WhatsApp.\n\nTry commands like:\n• Build an attendance management system\n• Add Excel export\n• Change login design to dark mode\n• What's my project status?\n\nSwarmOS Ready 🚀`,
  });
};

module.exports = {
  sendWhatsAppMessage,
  sendWelcomeWhatsAppMessage,
  getMode,
  formatPhone,
};
