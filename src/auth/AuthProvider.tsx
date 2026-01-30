import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthUser } from "../types/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode<AuthUser>(token) : null;
  });

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode<AuthUser>(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
