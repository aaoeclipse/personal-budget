export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}
