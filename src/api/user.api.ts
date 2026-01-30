// api/user.api.ts
import axiosPrivate from "../lib/axios/axiosPrivate";

export const getUsers = async (page = 1, limit = 10) => {
  const res = await axiosPrivate.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateUserRole = async (userId: string, role: "ADMIN" | "MANAGER" | "STAFF") => {
  const res = await axiosPrivate.patch(`/users/${userId}/role`, { role });
  return res.data;
};

export const updateUserStatus = async (userId: string, status: "ACTIVE" | "INACTIVE") => {
  const res = await axiosPrivate.patch(`/users/${userId}/status`, { status });
  return res.data;
};