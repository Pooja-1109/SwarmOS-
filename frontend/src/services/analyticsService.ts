import API from "./api";

export const getProjectAnalytics = async (projectId: string) => {
  const response = await API.get(`/analytics/${projectId}`);
  return response.data;
};
