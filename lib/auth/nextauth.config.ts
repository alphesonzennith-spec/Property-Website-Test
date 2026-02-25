// lib/auth/nextauth.config.ts
import type { NextAuthConfig } from 'next-auth'
import { createSingpassProvider } from './singpass-provider'
import { processMyInfoData } from '../singpass/myinfo'
import { MyInfoPersonResponse } from '../singpass/types'
import type { SingpassVerification, VerificationBadge } from '@/types/user'

const useMockSingpass = process.env.USE_MOCK_SINGPASS === 'true'

export const authOptions: NextAuthConfig = {
  providers: [
    createSingpassProvider(useMockSingpass),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/verify',
    error: '/verify',
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in with Singpass
      if (account?.provider === 'singpass' && profile) {
        try {
          const myInfo = profile as unknown as MyInfoPersonResponse

          // Process MyInfo data (hashes NRIC)
          const processedData = await processMyInfoData(myInfo)

          // Create verification object
          const verification: SingpassVerification = {
            verified: true,
            verifiedAt: new Date().toISOString() as unknown as Date,
            nricHash: processedData.nricHash,
            name: processedData.name,
            nationality: processedData.nationality,
            dateOfBirth: processedData.dateOfBirth,
            homeAddress: processedData.homeAddress,
          }

          token.singpassVerification = verification

          // Add verification badge
          const badge: VerificationBadge = {
            type: 'singpass',
            label: 'Singpass Verified',
            issuedAt: new Date().toISOString() as unknown as Date,
            expiresAt: undefined,
          }

          token.verificationBadges = [badge]

          // SUPABASE: Save verification to database
          // await saveVerificationToDatabase(token.sub, verification, badge)

          console.log('Singpass verification successful for user', token.sub)
        } catch (error) {
          console.error('Singpass verification failed:', error)
          // Continue without verification - user can retry
        }
      }

      return token
    },

    async session({ session, token }) {
      // Add user ID
      session.user.id = token.sub as string
      session.user.email = token.email as string || ''

      // Add Singpass verification data to session
      if (token.singpassVerification) {
        session.user.singpassVerification = token.singpassVerification
      }

      if (token.verificationBadges) {
        session.user.verificationBadges = token.verificationBadges
      }

      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

import NextAuth from 'next-auth'
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
