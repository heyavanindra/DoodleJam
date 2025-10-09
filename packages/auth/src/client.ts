import { jwtClient } from "better-auth/client/plugins"
import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"
import dotenv from "dotenv"
export const authClient =  createAuthClient({
    baseURL:process.env.NEXT_PUBLIC_BASE_URL,
    
    plugins:[jwtClient(),nextCookies()]
})