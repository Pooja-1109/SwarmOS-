import API from "./api";

export const sendChatMessage = async (projectId: string, text: string) => {
  const response = await API.post("/chat", { projectId, text });
  return response.data;
};

export const getChatHistory = async (projectId: string) => {
  const response = await API.get(`/chat/${projectId}`);
  return response.data;
};
