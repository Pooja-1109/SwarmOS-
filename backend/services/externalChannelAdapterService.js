const User = require("../models/User");
const Project = require("../models/Project");
const { executeChannelCommand } = require("./channelService");
const { sendWhatsAppMessage, formatPhone } = require("./whatsappService");

const normalizeWhatsAppNumber = (value = "") => {
  return formatPhone(value);
};

const extractSenderPhone = (payload = {}) => {
  const metaWaId = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
  const metaFrom = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
  const directFrom = payload?.from || payload?.user || payload?.phone || payload?.sender;
  
  const rawNumber = metaWaId || metaFrom || directFrom || "";
  return normalizeWhatsAppNumber(rawNumber);
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
  const senderPhone = extractSenderPhone(payload);

  return {
    channelType,
    projectId,
    message,
    senderPhone,
    state: payload.state || payload.data || {},
    rawPayload: payload,
  };
};

const handleExternalCommand = async ({ source, payload = {}, userId }) => {
  const normalized = normalizeExternalPayload(source, payload);

  // 1. Safety Check: Meta Cloud API sends non-message status updates (delivered, read, etc.)
  if (!normalized.message || !normalized.message.trim()) {
    return {
      success: true,
      ignored: true,
      reason: "Non-text or status update event received safely.",
    };
  }

  const senderPhone = normalized.senderPhone;
  const senderDigits = senderPhone.replace("+", "");

  // 2. User Identification
  let targetUser = null;

  if (userId) {
    targetUser = await User.findById(userId).lean();
  }

  if (!targetUser && senderPhone) {
    targetUser = await User.findOne({
      $or: [
        { whatsappNumber: senderPhone },
        { whatsappNumber: senderDigits },
        { phone: senderPhone },
        { phone: senderDigits },
      ],
    }).lean();
  }

  // User not found check
  if (!targetUser) {
    if (senderPhone && normalized.channelType === "whatsapp") {
      await sendWhatsAppMessage({
        to: senderPhone,
        message: `⚠️ Phone number ${senderPhone} is not registered with SwarmOS.\n\nPlease log in at SwarmOS and register your phone number in Settings to enable WhatsApp AI development control.`,
      }).catch((err) => console.error("Error sending user not found WhatsApp message:", err.message));
    }
    return {
      success: false,
      warning: "User not found for incoming phone number.",
      senderPhone,
    };
  }

  // WhatsApp Permission Check
  if (normalized.channelType === "whatsapp" && targetUser.whatsappOptIn === false) {
    if (senderPhone) {
      await sendWhatsAppMessage({
        to: senderPhone,
        message: `⚠️ WhatsApp AI Development Control is disabled for your SwarmOS account.\n\nPlease log in to SwarmOS and enable WhatsApp permission in your profile settings.`,
      }).catch((err) => console.error("Error sending opt-in warning WhatsApp message:", err.message));
    }
    return {
      success: false,
      warning: "User has disabled WhatsApp integration.",
      userId: targetUser._id,
    };
  }

  // 3. Project Identification & Selection
  let targetProjectId = normalized.projectId;
  let targetProject = null;

  const userProjects = await Project.find({ owner: targetUser._id }).sort({ updatedAt: -1 });

  if (userProjects.length === 0) {
    if (senderPhone && normalized.channelType === "whatsapp") {
      await sendWhatsAppMessage({
        to: senderPhone,
        message: `⚠️ You don't have any active software projects in SwarmOS yet.\n\nLog in to SwarmOS and click '+ New Project' to start your first project with your AI team!`,
      }).catch((err) => console.error("Error sending no project WhatsApp message:", err.message));
    }
    return {
      success: false,
      warning: "No active projects found for user.",
      userId: targetUser._id,
    };
  }

  if (targetProjectId) {
    targetProject = userProjects.find((p) => p._id.toString() === targetProjectId);
  }

  if (!targetProject) {
    const messageText = normalized.message.trim();

    // Check if user specified a project index or title in their message
    const projectIndexMatch = messageText.match(/project\s*(\d+)/i) || messageText.match(/^(\d+)\./);
    const projectTitleMatch = messageText.match(/project\s*:\s*([a-z0-9\s]+)/i);

    if (projectIndexMatch) {
      const idx = parseInt(projectIndexMatch[1], 10) - 1;
      if (userProjects[idx]) {
        targetProject = userProjects[idx];
      }
    } else if (projectTitleMatch) {
      const titleQuery = projectTitleMatch[1].trim().toLowerCase();
      targetProject = userProjects.find((p) => p.title.toLowerCase().includes(titleQuery));
    }

    // Single active project fallback
    if (!targetProject && userProjects.length === 1) {
      targetProject = userProjects[0];
    }

    // Multiple projects exist and user didn't specify which project
    if (!targetProject && userProjects.length > 1) {
      const projectListText = userProjects
        .map((p, idx) => `${idx + 1}. ${p.title} (${p.status})`)
        .join("\n");

      const promptMsg = `Which project should your AI team update?\n\n${projectListText}\n\nReply with: 'project 1: ${messageText}'`;

      if (senderPhone && normalized.channelType === "whatsapp") {
        await sendWhatsAppMessage({
          to: senderPhone,
          message: promptMsg,
        }).catch((err) => console.error("Error sending project select WhatsApp prompt:", err.message));
      }

      return {
        success: true,
        actionRequired: "SELECT_PROJECT",
        message: promptMsg,
        projects: userProjects.map((p) => ({ id: p._id, title: p.title })),
      };
    }
  }

  if (!targetProject) {
    targetProject = userProjects[0];
  }

  targetProjectId = targetProject._id.toString();

  // Clean prompt text if project prefix was present
  let cleanPrompt = normalized.message
    .replace(/project\s*:\s*[a-z0-9\s]+/i, "")
    .replace(/project\s*\d+\s*:\s*/i, "")
    .trim();

  if (!cleanPrompt) cleanPrompt = normalized.message;

  // 4. Command Execution & Swarm Workflow Trigger
  const result = await executeChannelCommand({
    projectId: targetProjectId,
    userId: targetUser._id.toString(),
    channelType: normalized.channelType,
    message: cleanPrompt,
    state: normalized.state,
  });

  // 5. Send Outgoing WhatsApp Confirmation
  const recipientPhone = senderPhone || targetUser.whatsappNumber || targetUser.phone;

  if (recipientPhone && normalized.channelType === "whatsapp") {
    const confirmationText = `🤖 SwarmOS Update: ${targetProject.title}\n\n${
      result.orchestratorMessage || "Got it! Your request has been queued for your AI agent team."
    }\n\nStatus: ${targetProject.status} • Progress: ${targetProject.progress || 0}%`;

    await sendWhatsAppMessage({
      to: recipientPhone,
      message: confirmationText,
    }).catch((err) => console.error("Error sending WhatsApp confirmation:", err.message));
  }

  return {
    success: true,
    projectId: targetProjectId,
    projectTitle: targetProject.title,
    userId: targetUser._id,
    orchestratorResult: result,
  };
};

module.exports = {
  normalizeExternalPayload,
  handleExternalCommand,
};
