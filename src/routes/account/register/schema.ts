import { z } from "zod";

export const formSchema = z.object({
  username: z.string().min(5, "Username must contain atleast 5 characters").max(50, "Username lenght cannot exceed 50 characters."),
  email: z.string().min(1, "Email is required").email(),
  password: z.string().min(6, "Password must me minimum 6 charaters long"),
  confirmPassword: z.string().min(6, "Password must me minimum 6 charaters long")
});

export type FormSchema = typeof formSchema;
