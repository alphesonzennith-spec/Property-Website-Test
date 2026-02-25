// components/auth/SingpassButton.tsx
'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface SingpassButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onSuccess?: () => void
  onError?: (error: Error) => void
  callbackUrl?: string
}

export function SingpassButton({
  variant = 'default',
  size = 'lg',
  onSuccess,
  onError,
  callbackUrl = '/dashboard',
}: SingpassButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const isVerified = session?.user.singpassVerification?.verified

  const handleVerify = async () => {
    try {
      setIsLoading(true)
      await signIn('singpass', { callbackUrl })
      onSuccess?.()
    } catch (error) {
      const err = error as Error
      onError?.(err)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Already verified state
  if (isVerified) {
    return (
      <Button
        variant="outline"
        size={size}
        className="border-emerald-600 text-emerald-600 cursor-default"
        disabled
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        Singpass Verified
      </Button>
    )
  }

  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <Button disabled size={size} className="bg-[#BE2E2D]/70">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Verifying...
      </Button>
    )
  }

  // Default state (not verified)
  return (
    <Button
      onClick={handleVerify}
      size={size}
      className="bg-[#BE2E2D] hover:bg-[#A02625] text-white font-semibold"
    >
      <ShieldCheck className="w-5 h-5 mr-2" />
      Verify with Singpass
    </Button>
  )
}
