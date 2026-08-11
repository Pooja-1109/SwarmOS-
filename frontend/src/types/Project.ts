export interface AgentType {
  _id?: string;
  name: string;
  role?: string;
  status: "Idle" | "Thinking" | "Working" | "Waiting" | "Completed" | "Error";
  currentTask?: string;
  progress?: number;
  lastActivity?: string;
}

export interface ProjectType {
  _id: string;
  title: string;
  description: string;
  category?: string;
  status: "Planning" | "Active" | "On Hold" | "Completed" | "Archived" | "Pending" | "Running";
  priority?: "Low" | "Medium" | "High" | "Critical";
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  progress: number;
  requirements?: string;
  agents?: AgentType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskType {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  assignedAgent: string;
  assignedUser?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Backlog" | "Todo" | "In Progress" | "Review" | "Completed" | "Blocked";
  progress: number;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentType {
  _id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy?: string;
  createdAt?: string;
}

export interface MessageType {
  _id: string;
  projectId: string;
  sender: "user" | "assistant" | string;
  text: string;
  sources?: { fileName: string; snippet?: string }[];
  createdAt?: string;
}

export interface ActivityType {
  _id: string;
  projectId: string;
  user?: { name: string; email: string };
  agentName: string;
  action: string;
  details: string;
  createdAt: string;
}
