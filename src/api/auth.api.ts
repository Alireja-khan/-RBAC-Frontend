import axiosPublic from "../lib/axios/axiosPublic";

interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (data: LoginPayload) => {
  const res = await axiosPublic.post("/auth/login", data);
  return res.data;
};

// ✅ PUBLIC
export const validateInviteApi = async (token: string) => {
  const res = await axiosPublic.get(`/auth/invite/${token}`);
  return res.data;
};

interface RegisterPayload {
  token: string;
  name: string;
  password: string;
}

export const registerViaInviteApi = async (data: RegisterPayload) => {
  const res = await axiosPublic.post("/auth/register-via-invite", data);
  return res.data;
};
