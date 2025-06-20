import { z } from "zod";

export const signupSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

export const loginSchema = z.object({
  username:z.string(),
  password:z.string()
})

export const CreateRoomSchema = z.object({
    name:z.string().min(3).max(20),
})
