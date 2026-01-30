// api/project.api.ts
import axiosPrivate from "../lib/axios/axiosPrivate";

export const getProjects = async () => {
  const res = await axiosPrivate.get('/projects');
  return res.data;
};

export const createProject = async (projectData: { name: string; description?: string }) => {
  const res = await axiosPrivate.post('/projects', projectData);
  return res.data;
};

export const updateProject = async (projectId: string, projectData: { name?: string; description?: string; status?: "ACTIVE" | "ARCHIVED" | "DELETED" }) => {
  const res = await axiosPrivate.patch(`/projects/${projectId}`, projectData);
  return res.data;
};

export const deleteProject = async (projectId: string) => {
  const res = await axiosPrivate.delete(`/projects/${projectId}`);
  return res.data;
};