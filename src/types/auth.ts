// Authentication types
export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface JWTData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  username: string;
  role: string;
}