import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

const getToken = () => localStorage.getItem("token");

export const getDashboard = async () => {
  const response = await axios.get(API, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return response.data;
};