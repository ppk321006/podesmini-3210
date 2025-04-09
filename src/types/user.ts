
export enum UserRole {
  ADMIN = "admin",
  PML = "pml",
  PPL = "ppl",
  VIEWER = "viewer",
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  pmlId?: string; // For PPL users, to link to their PML
}

export interface LoginFormData {
  username: string;
  password: string;
}
