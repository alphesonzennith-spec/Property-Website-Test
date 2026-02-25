import type { SingpassVerification, VerificationBadge } from './user'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      singpassVerification?: SingpassVerification
      verificationBadges?: VerificationBadge[]
    }
  }

  interface JWT {
    singpassVerification?: SingpassVerification
    verificationBadges?: VerificationBadge[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    singpassVerification?: SingpassVerification
    verificationBadges?: VerificationBadge[]
  }
}
