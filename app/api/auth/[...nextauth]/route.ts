import { handlers } from "@/auth"

// Force Node.js runtime instead of Edge runtime (required for Prisma)
export const runtime = 'nodejs'

export const { GET, POST } = handlers
