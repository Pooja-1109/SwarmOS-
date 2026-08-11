import API from "./api";

export const getProjectActivities = async (projectId: string) => {
  const response = await API.get(`/activity/project/${projectId}`);
  return response.data;
};
