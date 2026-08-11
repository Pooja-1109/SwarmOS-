import API from "./api";

export const getProjectChannels = async (projectId: string) => {
  const response = await API.get(`/channels/project/${projectId}`);
  return response.data;
};

export const upsertProjectChannel = async (projectId: string, payload: any) => {
  const response = await API.post(`/channels/project/${projectId}`, payload);
  return response.data;
};

export const syncProjectChannels = async (projectId: string, state: any) => {
  const response = await API.post(`/channels/project/${projectId}/sync`, { state });
  return response.data;
};

export const sendChannelProjectCommand = async (projectId: string, channelType: string, message: string, state?: any) => {
  const response = await API.post(`/channels/project/${projectId}/command`, {
    channelType,
    message,
    state,
  });
  return response.data;
};

export const sendWhatsAppWebhook = async (projectId: string, payload: any) => {
  const response = await API.post(`/external-channels/whatsapp/webhook`, { projectId, ...payload });
  return response.data;
};

export const sendVoiceWebhook = async (projectId: string, payload: any) => {
  const response = await API.post(`/external-channels/voice/webhook`, { projectId, ...payload });
  return response.data;
};
