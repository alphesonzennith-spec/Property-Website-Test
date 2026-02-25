// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { handlers } from '@/lib/auth/nextauth.config'

export const { GET, POST } = handlers
