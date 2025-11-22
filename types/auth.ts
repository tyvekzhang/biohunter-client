export type OAuth2PasswordRequestForm = {
  username: string;
  password: string;
};

export type UserCredential = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export interface AssignUserRoles {
  user_id: string;
  role_ids: string[];
}
