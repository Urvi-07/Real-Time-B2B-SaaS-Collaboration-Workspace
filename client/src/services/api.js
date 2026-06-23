import axios from "axios";

const api = axios.create({
  baseURL: "https://real-time-b2b-saas-collaboration.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;