export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type AuthenticatedUser = Omit<User, 'password'>;
