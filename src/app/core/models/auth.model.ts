export interface GeneralResponse {
  estado: boolean;
  codigo: number;
  mensaje: string;
}

export interface LoginResponse extends GeneralResponse {
  token: string;
  userId: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  active: number;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  fullname: string;
  areaId?: number | null;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  token: string;
  newPassword: string;
}
