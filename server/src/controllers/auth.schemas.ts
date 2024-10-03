import { z } from 'zod';

const emailSchema = z.string().email().min(1).max(255);
const passwordSchema = z.string().min(6).max(255);
const userAgentSchema = z.string().optional(); // to know where the request is coming

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verificationCodeSchema = z.string().min(1).max(24);
