import api from "./axios";

interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (data: LoginPayload) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
// interface RegisterPayLoad {
//     name: string;
//     email: string;
//     password: string;
//     token: string;
// }