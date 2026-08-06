import axios from "axios";

const API = "http://localhost:5000/api/projects";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const createProject = async (project: {
  title: string;
  description: string;
}) => {
  const response = await axios.post(API, project, authHeader());
  return response.data;
};

export const getProjects = async () => {
  const response = await axios.get(API, authHeader());
  return response.data;
};

export const getProject = async (id: string) => {
  const response = await axios.get(`${API}/${id}`, authHeader());
  return response.data;
};