import API from "./api";

export const uploadFile = async (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("projectId", projectId);
  formData.append("file", file);

  const response = await API.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getProjectFiles = async (projectId: string) => {
  const response = await API.get(`/files/project/${projectId}`);
  return response.data;
};

export const getFile = async (id: string) => {
  const response = await API.get(`/files/${id}`);
  return response.data;
};

export const deleteFile = async (id: string) => {
  const response = await API.delete(`/files/${id}`);
  return response.data;
};

export const queryProjectKnowledge = async (projectId: string, query: string) => {
  const response = await API.post("/files/query", { projectId, query });
  return response.data;
};
