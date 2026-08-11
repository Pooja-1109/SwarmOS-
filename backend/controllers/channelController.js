const { getProjectChannels, upsertProjectChannel, syncProjectStateAcrossChannels, executeChannelCommand } = require("../services/channelService");

const listProjectChannels = async (req, res) => {
  try {
    const channels = await getProjectChannels(req.params.projectId);
    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to load project channels." });
  }
};

const saveProjectChannel = async (req, res) => {
  try {
    const entry = await upsertProjectChannel({
      projectId: req.params.projectId,
      userId: req.user.id,
      channelType: req.body.channelType,
      status: req.body.status,
      endpoint: req.body.endpoint,
      config: req.body.config,
      projectStateSnapshot: req.body.projectStateSnapshot,
      lastMessage: req.body.lastMessage,
      lastCommand: req.body.lastCommand,
    });

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to save channel config." });
  }
};

const syncProjectChannelState = async (req, res) => {
  try {
    const result = await syncProjectStateAcrossChannels(req.params.projectId, req.body?.state || {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to sync project state." });
  }
};

const runProjectCommandFromChannel = async (req, res) => {
  try {
    const { channelType, message, state } = req.body || {};
    const result = await executeChannelCommand({
      projectId: req.params.projectId,
      userId: req.user.id,
      channelType,
      message,
      state,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to process channel command." });
  }
};

module.exports = {
  listProjectChannels,
  saveProjectChannel,
  syncProjectChannelState,
  runProjectCommandFromChannel,
};
