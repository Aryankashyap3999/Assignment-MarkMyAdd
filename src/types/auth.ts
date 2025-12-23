export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
};
