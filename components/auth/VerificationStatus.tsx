// components/auth/VerificationStatus.tsx
'use client'

import { useSession } from 'next-auth/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function VerificationStatus() {
  const { data: session } = useSession()
  const verification = session?.user.singpassVerification

  if (!session) {
    return (
      <Alert variant="default" className="border-gray-300">
        <AlertCircle className="text-gray-500" />
        <AlertTitle>Not Logged In</AlertTitle>
        <AlertDescription>Sign in to verify your identity</AlertDescription>
      </Alert>
    )
  }

  if (verification?.verified) {
    return (
      <Alert variant="default" className="border-emerald-200 bg-emerald-50">
        <CheckCircle className="text-emerald-600" />
        <AlertTitle className="text-emerald-900">Singpass Verified ✓</AlertTitle>
        <AlertDescription className="text-emerald-700">
          Verified{' '}
          {formatDistanceToNow(new Date(verification.verifiedAt!), { addSuffix: true })}
        </AlertDescription>
      </Alert>
    )
  }

  // Pending or unverified
  return (
    <Alert variant="default" className="border-amber-200 bg-amber-50">
      <Clock className="text-amber-600" />
      <AlertTitle className="text-amber-900">Verification Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        Verify with Singpass to list properties and contact sellers.
        <Link href="/verify" className="block mt-2 text-amber-800 font-semibold hover:underline">
          Verify Now →
        </Link>
      </AlertDescription>
    </Alert>
  )
}
