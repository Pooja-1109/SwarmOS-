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

export const getExecutionStatus = async (id: string) => {
  const response = await API.get(`/projects/${id}/execution-status`);
  return response.data;
};

export const getProjectGeneratedFiles = async (id: string) => {
  const response = await API.get(`/projects/${id}/files`);
  return response.data;
};

export const downloadProjectZip = async (id: string) => {
  try {
    const response = await API.get(`/projects/${id}/download`, {
      responseType: "blob",
    });

    let filename = `swarmos-project.zip`;
    const headers = response.headers;
    const disposition =
      headers["content-disposition"] ||
      headers["Content-Disposition"] ||
      (typeof headers.get === "function" ? headers.get("content-disposition") : null);

    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 500);
  } catch (err: any) {
    console.error("Download ZIP Error:", err);
    if (err.response) {
      if (err.response.status === 401) {
        alert("Please log in again.");
      } else if (err.response.status === 404) {
        alert("This project doesn't have generated files yet.");
      } else {
        alert("Unable to create the project ZIP.");
      }
    } else {
      alert("Unable to create the project ZIP.");
    }
  }
};

export const getProjectLogs = async (id: string) => {
  const response = await API.get(`/projects/${id}/logs`);
  return response.data;
};

export const getProjectTimeline = async (id: string) => {
  const response = await API.get(`/projects/${id}/timeline`);
  return response.data;
};

export const runProject = async (id: string) => {
  const response = await API.post(`/projects/${id}/run`);
  return response.data;
};

export const stopProject = async (id: string) => {
  const response = await API.post(`/projects/${id}/stop`);
  return response.data;
};

export const getProjectRuntime = async (id: string) => {
  const response = await API.get(`/projects/${id}/runtime`);
  return response.data;
};

export const getProjectRuntimeLogs = async (id: string) => {
  const response = await API.get(`/projects/${id}/runtime-logs`);
  return response.data;
};

export const deployProject = async (id: string) => {
  const response = await API.post(`/projects/${id}/deploy`);
  return response.data;
};