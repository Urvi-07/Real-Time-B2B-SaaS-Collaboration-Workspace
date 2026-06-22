import api from "./axios";

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export const getWorkspaces = async () => {
  const res = await api.get("/workspaces");
  return res.data;
};

export const createWorkspace = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await api.post("/workspaces", data);
  return res.data;
};