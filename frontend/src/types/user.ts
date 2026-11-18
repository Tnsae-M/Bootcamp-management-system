// Canonical User and Role Types for CSEC-ASTU BMS
export type Role = 'SUPER_ADMIN' | 'DIVISION_ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
export type ScopeType = 'GLOBAL' | 'DIVISION' | 'BOOTCAMP';

// Legacy presentation alias for active role switcher
export type UserRole = 'SUPER ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';

export interface UserRoleAssignment {
  id?: string;
  userId?: string;
  role: Role | string;
  scopeType: ScopeType | string;
  scopeId?: string | null;
}

export interface User {
  id: string;
  _id?: string; // compatibility with legacy mongo refs
  fullName: string;
  name?: string; // compatibility alias
  email: string;
  universityId?: string | null;
  department?: string | null;
  telegramUsername?: string | null;
  isEmailVerified: boolean;
  roles: string[];
  roleAssignments?: UserRoleAssignment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens?: AuthTokens;
  accessToken?: string;
}

