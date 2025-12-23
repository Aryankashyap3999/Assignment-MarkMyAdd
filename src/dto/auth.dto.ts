import { z } from "zod";

export const SignupDto = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginDto = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export type SignupDtoType = z.infer<typeof SignupDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
