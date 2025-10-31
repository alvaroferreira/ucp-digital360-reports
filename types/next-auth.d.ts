import NextAuth from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      active: boolean
    }
  }

  interface User {
    id: string
    role?: Role
    active?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    userId?: string
    role?: Role
    active?: boolean
  }
}
