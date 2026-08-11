import API from "./api";

export const generateProjectResearch = async (projectId: string, query?: string) => {
  const response = await API.post(`/research/project/${projectId}/research`, { query });
  return response.data;
};

export const getProjectResearch = async (projectId: string) => {
  const response = await API.get(`/research/project/${projectId}/research`);
  return response.data;
};

export const createProjectVisualization = async (projectId: string, payload?: any) => {
  const response = await API.post(`/research/project/${projectId}/visualization`, payload || {});
  return response.data;
};

export const getProjectVisualizations = async (projectId: string) => {
  const response = await API.get(`/research/project/${projectId}/visualization`);
  return response.data;
};

export const createProjectDocument = async (projectId: string, payload?: any) => {
  const response = await API.post(`/research/project/${projectId}/document`, payload || {});
  return response.data;
};

export const getProjectDocuments = async (projectId: string) => {
  const response = await API.get(`/research/project/${projectId}/document`);
  return response.data;
};
