import API from '../config/apiClient';

type LoginParams = {
  email: string;
  password: string;
};

type RegisterParams = LoginParams & {
  confirmPassword: string;
};

type ResetPasswordParams = {
  verificationCode: string;
  password: string;
};

export const login = async (data: LoginParams) => API.post('/auth/login', data);

export const logout = async () => API.get('/auth/logout');

export const register = async (data: RegisterParams) =>
  API.post('/auth/register', data);

export const verifyEmail = async (code: string) =>
  API.get(`/auth/email/verify/${code}`);

export const sendPasswordResetEmail = async (email: string) =>
  API.post('/auth/password/forgot', { email });

export const resetPassword = async ({
  verificationCode,
  password,
}: ResetPasswordParams) =>
  API.post('/auth/password/reset', { verificationCode, password });

export const getUser = async () => API.get('/user');

export const getSessions = async () => API.get('/sessions');

export const deleteSessions = async (id: number) =>
  API.delete(`/sessions/${id}`);
