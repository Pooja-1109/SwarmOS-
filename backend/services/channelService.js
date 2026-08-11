const Project = require("../models/Project");
const ProjectChannel = require("../models/ProjectChannel");
const { orchestrateProjectRequest } = require("./orchestratorService");

const normalizeChannelCommand = (channelType, rawMessage = "") => {
  let message = String(rawMessage || "").trim();

  if (!message) return "";

  const prefixes = {
    whatsapp: ["wa:", "whatsapp:", "wa ", "whatsapp "],
    voice: ["voice:", "say:", "listen:"],
    web: ["web:", "cmd:", "command:", "project:"],
  };

  const list = prefixes[channelType] || [];
  for (const prefix of list) {
    if (message.toLowerCase().startsWith(prefix)) {
      message = message.slice(prefix.length).trim();
      break;
    }
  }

  return message.replace(/\s+/g, " ").trim();
};

const getProjectChannels = async (projectId) => {
  return ProjectChannel.find({ projectId }).sort({ createdAt: -1 });
};

const upsertProjectChannel = async ({ projectId, userId, channelType, status, endpoint, config, projectStateSnapshot, lastMessage, lastCommand }) => {
  const existing = await ProjectChannel.findOne({ projectId, channelType });

  const payload = {
    projectId,
    userId,
    channelType,
    status: status || "active",
    endpoint: endpoint || "",
    config: config || {},
    projectStateSnapshot: projectStateSnapshot || {},
    lastMessage: lastMessage || "",
    lastCommand: lastCommand || "",
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return ProjectChannel.create(payload);
};

const syncProjectStateAcrossChannels = async (projectId, state = {}) => {
  const update = {
    communicationState: {
      ...state,
      lastSyncedAt: new Date(),
      syncVersion: (state.syncVersion || 0) + 1,
    },
  };

  await Project.findByIdAndUpdate(projectId, update, { new: true });

  const channels = await ProjectChannel.find({ projectId });

  await Promise.all(
    channels.map((channel) => {
      channel.projectStateSnapshot = {
        ...state,
        lastSyncedAt: new Date().toISOString(),
        syncVersion: (state.syncVersion || 0) + 1,
      };
      return channel.save();
    })
  );

  return { projectId, updatedAt: update.communicationState.lastSyncedAt, channels: channels.length };
};

const executeChannelCommand = async ({ projectId, userId, channelType, message, state = {} }) => {
  if (!projectId || !userId || !channelType) {
    throw new Error("Project, user, and channel type are required.");
  }

  const normalizedPrompt = normalizeChannelCommand(channelType, message);
  if (!normalizedPrompt) {
    throw new Error("A valid command message is required.");
  }

  const result = await orchestrateProjectRequest({
    projectId,
    userId,
    prompt: normalizedPrompt,
  });

  await upsertProjectChannel({
    projectId,
    userId,
    channelType,
    status: "active",
    lastMessage: message,
    lastCommand: normalizedPrompt,
    projectStateSnapshot: {
      ...state,
      channelType,
      projectId,
      lastCommand: normalizedPrompt,
      lastUpdated: new Date().toISOString(),
    },
  });

  return {
    ...result,
    channelType,
    normalizedPrompt,
    source: `${channelType.toUpperCase()} Channel`,
  };
};

module.exports = {
  getProjectChannels,
  upsertProjectChannel,
  syncProjectStateAcrossChannels,
  normalizeChannelCommand,
  executeChannelCommand,
};
