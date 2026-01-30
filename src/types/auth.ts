export type UserRole = "ADMIN" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
}
