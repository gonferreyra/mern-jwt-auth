import API from '../config/apiClient';

type LoginParams = {
  email: string;
  password: string;
};

type RegisterParams = LoginParams & {
  confirmPassword: string;
};

export const login = async (data: LoginParams) => API.post('/auth/login', data);

export const register = async (data: RegisterParams) =>
  API.post('/auth/register', data);

export const verifyEmail = async (code: string) =>
  API.get(`/auth/email/verify/${code}`);

export const sendPasswordResetEmail = async (email: string) =>
  API.post('/auth/password/forgot', { email });
