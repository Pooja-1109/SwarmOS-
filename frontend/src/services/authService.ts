import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Register
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await API.post("/register", userData);
  return res.data;
};

// Login
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const res = await API.post("/login", userData);
  return res.data;
};

// Protected Profile
export const getProfile = async () => {
  const res = await API.get("/profile");
  return res.data;
};

export default API;