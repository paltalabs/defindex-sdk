// Authentication types
export interface AuthRegisterDto {
    username: string;
    password: string;
    email: string;
  }
  
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
  
  