import API from "./api";

export interface ProjectData {
  title: string;
  description: string;
  category?: string;
  priority?: string;
  status?: string;
  requirements?: string;
}

export const createProject = async (project: ProjectData) => {
  const response = await API.post("/projects", project);
  return response.data;
};

export const getProjects = async (params?: {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
}) => {
  const response = await API.get("/projects", { params });
  return response.data;
};

export const getProject = async (id: string) => {
  const response = await API.get(`/projects/${id}`);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<ProjectData & { progress: number }>) => {
  const response = await API.put(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await API.delete(`/projects/${id}`);
  return response.data;
};

export const getProjectStatus = async (id: string) => {
  const response = await API.get(`/projects/${id}/status`);
  return response.data;
};

export const getProjectSummary = async (id: string) => {
  const response = await API.get(`/projects/${id}/summary`);
  return response.data;
};