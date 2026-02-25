// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // High-trust routes requiring Singpass verification
    const verificationRequiredRoutes = ['/dashboard/list-property', '/dashboard/offers']

    const requiresVerification = verificationRequiredRoutes.some((route) =>
      path.startsWith(route)
    )

    // Also check for contact info access pattern
    const isContactRoute = /^\/properties\/[^\/]+\/contact$/.test(path)

    if (requiresVerification || isContactRoute) {
      // SINGPASS: Enforce verification in production
      if (!token?.singpassVerification?.verified) {
        const url = new URL('/verify', req.url)
        url.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require login for all /dashboard routes
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/properties/:path*/contact'],
}
