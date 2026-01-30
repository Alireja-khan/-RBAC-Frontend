export type UserRole = "ADMIN" | "MANAGER" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
  token: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
}
