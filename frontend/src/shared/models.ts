export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  username: string;
  userId: number;
  token: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface Todo {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  userId: number | null;
}

export interface ApiMessage {
  message: string;
}
