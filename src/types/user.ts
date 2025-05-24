
// Define UserRole as both a type and an object with values
export type UserRole = 'admin' | 'pml' | 'ppl' | 'viewer';

// Create a UserRole object that can be referenced in code
export const UserRole = {
  ADMIN: 'admin' as UserRole,
  PML: 'pml' as UserRole,
  PPL: 'ppl' as UserRole,
  VIEWER: 'viewer' as UserRole
};

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
