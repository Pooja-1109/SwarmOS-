import API from "./api";

export const runSecurityScan = async (projectId: string) => {
  const response = await API.post(`/security/project/${projectId}/security`);
  return response.data;
};

export const getSecurityReport = async (projectId: string) => {
  const response = await API.get(`/security/project/${projectId}/security`);
  return response.data;
};

export const runProjectTests = async (projectId: string, testName?: string) => {
  const response = await API.post(`/security/project/${projectId}/tests`, { testName });
  return response.data;
};

export const getProjectTestRuns = async (projectId: string) => {
  const response = await API.get(`/security/project/${projectId}/tests`);
  return response.data;
};
