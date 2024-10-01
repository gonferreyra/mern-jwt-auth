const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const MONGO_URI = getEnv('MONGO_URI');
export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const PORT = getEnv('PORT', '8080');
export const API_ORIGIN = getEnv('API_ORIGIN');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
// export const EMAIL_SENDER = getEnv('EMAIL_SENDER');
// export const RESEND_API_KEY = getEnv('RESEND)API_KEY');
