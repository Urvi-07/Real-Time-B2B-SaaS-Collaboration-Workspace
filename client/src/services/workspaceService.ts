import axios from "axios";

const API_URL =
  "https://real-time-b2b-saas-collaboration.onrender.com/api/workspaces";

export const getWorkspaces = async () => {
  const token = localStorage.getItem("token");

  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createWorkspace = async (data: any) => {
  const token = localStorage.getItem("token");

  return axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};