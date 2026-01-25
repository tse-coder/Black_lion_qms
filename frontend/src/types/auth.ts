export interface User {
  id: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Lab Technician' | 'Admin';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export const UserRoles = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor', 
  LAB_TECHNICIAN: 'Lab Technician',
  ADMIN: 'Admin'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRoles).includes(role as UserRole);
};

export const getRoleRedirectPath = (role: UserRole): string => {
  const rolePaths: Record<UserRole, string> = {
    [UserRoles.PATIENT]: '/patient/dashboard',
    [UserRoles.DOCTOR]: '/doctor/dashboard',
    [UserRoles.LAB_TECHNICIAN]: '/lab/dashboard',
    [UserRoles.ADMIN]: '/admin/dashboard'
  };
  
  return rolePaths[role] || '/dashboard';
};
