import * as z from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be at most 100 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, { message: "Password must contain at least one special character" }),

  email: z
    .string()
    .email({ message: "Invalid email address" })
});

export const loginSchema = z.object({
  username: z
    .email()
    .min(3, { message: "Username must be at least 3 characters long" }),
  
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
});

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Room name must be at least 3 characters long" })
    .max(50, { message: "Room name must be at most 50 characters long" })
    .regex(/^[a-zA-Z0-9\s]+$/, { message: "Room name can only contain letters, numbers, and spaces" })
});



export const shapesSchema = z.object({
  roomId :z.string(),
  shapeType:z.enum(["RECT","CIRCLE","PENCIL"]),
  shapes:z.object({
    x:z.number(),
    y:z.number(),
    width:z.number(),
    height:z.number()
  })
})