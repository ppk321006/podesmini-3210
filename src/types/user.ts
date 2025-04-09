
export type UserRole = 'admin' | 'pml' | 'ppl' | 'viewer';

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
