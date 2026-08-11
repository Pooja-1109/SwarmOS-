const User = require("../models/User");
const Project = require("../models/Project");
const { executeChannelCommand } = require("./channelService");

const normalizeWhatsAppNumber = (value = "") => {
  const digits = `${value}`.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

const resolveProjectId = (payload = {}) => {
  return (
    payload.projectId ||
    payload.project_id ||
    payload.metadata?.projectId ||
    payload.metadata?.project_id ||
    payload.data?.projectId ||
    payload.data?.project_id ||
    ""
  );
};

const resolveTextMessage = ({ channelType, payload = {} }) => {
  if (channelType === "whatsapp") {
    return (
      payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ||
      payload?.messages?.[0]?.text?.body ||
      payload?.messages?.[0]?.text ||
      payload?.Body ||
      payload?.text ||
      payload?.message ||
      ""
    );
  }

  if (channelType === "voice") {
    return (
      payload?.transcript ||
      payload?.text ||
      payload?.result?.transcript ||
      payload?.message ||
      payload?.Body ||
      ""
    );
  }

  return payload?.text || payload?.message || payload?.prompt || "";
};

const normalizeExternalPayload = (source, payload = {}) => {
  const channelType = (source || "web").toLowerCase();
  const message = resolveTextMessage({ channelType, payload });
  const projectId = resolveProjectId(payload);

  return {
    channelType,
    projectId,
    message,
    state: payload.state || payload.data || {},
    rawPayload: payload,
  };
};

const handleExternalCommand = async ({ source, payload = {}, userId }) => {
  const normalized = normalizeExternalPayload(source, payload);

  if (!normalized.message || !normalized.message.trim()) {
    throw new Error("A command message is required for the external channel request.");
  }

  let projectId = normalized.projectId;

  if (!projectId) {
    const whatsappNumber = normalizeWhatsAppNumber(
      payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id ||
        payload?.messages?.[0]?.from ||
        payload?.from ||
        payload?.user ||
        payload?.phone
    );

    if (whatsappNumber) {
      const matchedUser = await User.findOne({ whatsappNumber: whatsappNumber }).lean();
      if (matchedUser) {
        const projectTitle = normalized.message.match(/project\s*:\s*([a-z0-9\s]+)/i)?.[1]?.trim();
        const projectMatch = projectTitle
          ? await Project.findOne({ owner: matchedUser._id, title: { $regex: projectTitle, $options: "i" } }).sort({ updatedAt: -1 }).lean()
          : await Project.findOne({ owner: matchedUser._id }).sort({ updatedAt: -1 }).lean();
        if (projectMatch) {
          projectId = projectMatch._id.toString();
        }
      }
    }
  }

  if (!projectId) {
    throw new Error("Project was not found for this user. Please select or open a project first.");
  }

  return executeChannelCommand({
    projectId,
    userId: userId || (await User.findOne({ whatsappNumber: normalizeWhatsAppNumber(payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id || payload?.messages?.[0]?.from || payload?.from || payload?.phone) }).then((user) => user?._id.toString())).catch(() => null),
    channelType: normalized.channelType,
    message: normalized.message,
    state: normalized.state,
  });
};

module.exports = {
  normalizeExternalPayload,
  handleExternalCommand,
};
