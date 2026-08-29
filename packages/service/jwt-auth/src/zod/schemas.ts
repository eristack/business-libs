import { z } from "zod";

export const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerCredentialsBodySchema = z.object({
  subject: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(8),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterCredentialsBody = z.infer<
  typeof registerCredentialsBodySchema
>;
