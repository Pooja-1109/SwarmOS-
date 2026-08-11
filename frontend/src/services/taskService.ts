import API from "./api";

export interface TaskData {
  _id?: string;
  title: string;
  description?: string;
  projectId: string;
  assignedAgent?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  status?: "Backlog" | "Todo" | "In Progress" | "Review" | "Completed" | "Blocked";
  progress?: number;
  deadline?: string;
}

export const getTasks = async (params: {
  projectId: string;
  status?: string;
  priority?: string;
  agent?: string;
  search?: string;
}) => {
  const response = await API.get("/tasks", { params });
  return response.data;
};

export const createTask = async (task: TaskData) => {
  const response = await API.post("/tasks", task);
  return response.data;
};

export const updateTask = async (id: string, data: Partial<TaskData>) => {
  const response = await API.put(`/tasks/${id}`, data);
  return response.data;
};

export const updateTaskStatus = async (id: string, status: string) => {
  const response = await API.patch(`/tasks/${id}/status`, { status });
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};
