export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ultimo_login?: Date;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: Usuario;
  };
}

