import API from "./api";

export const getRequirementTrace = async (projectId: string) => {
  const response = await API.get(`/engineering/project/${projectId}/requirements`);
  return response.data;
};

export const getProjectQualityGate = async (projectId: string) => {
  const response = await API.get(`/engineering/project/${projectId}/quality-gate`);
  return response.data;
};

export const runSelfHeal = async (projectId: string, errorMessage?: string) => {
  const response = await API.post(`/engineering/project/${projectId}/self-heal`, { errorMessage });
  return response.data;
};
