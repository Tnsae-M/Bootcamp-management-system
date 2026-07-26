// Canonical User type — the frontend mirror of the wire shape defined in
// docs/adr/0001-canonical-user-wire-shape.md. Produced by the backend's
// shared sanitizer (backend/src/modules/users/user.sanitize.js).
// This is the ONLY User type in the frontend — do not redeclare it.

export type UserRole = 'SUPER ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export type UserStatus = 'active' | 'suspended' | 'graduated';

export interface PopulatedRef {
  _id: string;
  name?: string;
  title?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  divisionId: PopulatedRef | null;
  bootcamps: Array<{ bootcampId: PopulatedRef | null }>;
  isEmailVerified: boolean;
  createdAt: string;
}
