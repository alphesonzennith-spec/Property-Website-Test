// @ts-nocheck
// proxy.ts

import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  })

  const path = req.nextUrl.pathname

  const isDashboardRoute = path.startsWith('/dashboard')
  const isContactRoute = /^\/properties\/[^\/]+\/contact$/.test(path)

  // Require login for all /dashboard and contact routes
  if ((isDashboardRoute || isContactRoute) && !token) {
    const url = new URL('/verify', req.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // High-trust routes requiring Singpass verification
  const verificationRequiredRoutes = ['/dashboard/list-property', '/dashboard/offers']

  const requiresVerification = verificationRequiredRoutes.some((route) =>
    path.startsWith(route)
  )

  if (requiresVerification || isContactRoute) {
    // SINGPASS: Enforce verification in production
    if (!token?.singpassVerification?.verified) {
      const url = new URL('/verify', req.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: ['/dashboard/:path*', '/properties/:path*/contact'],
}
