import API from "./api";

export const startAgents = async (projectId: string) => {
  const response = await API.post(`/agents/${projectId}/start`);
  return response.data;
};

export const getProjectAgents = async (projectId: string) => {
  const response = await API.get(`/agents/${projectId}`);
  return response.data;
};

export const runSingleAgent = async (projectId: string, agentName: string) => {
  const response = await API.post(`/agents/${projectId}/run-agent`, { agentName });
  return response.data;
};