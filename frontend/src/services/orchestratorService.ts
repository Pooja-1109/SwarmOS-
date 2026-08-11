import API from "./api";

export const sendProjectCommand = async (projectId: string, prompt: string) => {
  const response = await API.post(`/orchestrator/project/${projectId}/command`, { prompt });
  return response.data;
};

export const getProjectMemory = async (projectId: string) => {
  const response = await API.get(`/orchestrator/project/${projectId}/memory`);
  return response.data;
};

export const getProjectDecisions = async (projectId: string) => {
  const response = await API.get(`/orchestrator/project/${projectId}/decisions`);
  return response.data;
};
