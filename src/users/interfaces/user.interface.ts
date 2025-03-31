export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles?: Array<{
    id: string;
    name: string;
  }>;
} 