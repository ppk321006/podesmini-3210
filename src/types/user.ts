
export enum UserRole {
  ADMIN = 'admin',
  PML = 'pml',
  PPL = 'ppl',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pml_id?: string | null;
  created_at?: string;
}
