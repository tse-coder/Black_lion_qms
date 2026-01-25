export interface User {
  id: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Lab Technician' | 'Admin';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationCredentials {
  username: string;
  email: string;
  password: string;
  role: 'Patient' | 'Doctor' | 'Lab Technician' | 'Admin';
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
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
