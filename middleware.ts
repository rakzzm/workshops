import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Since we're using client-side localStorage authentication,
// middleware can't check auth state (it's on the client).
// We'll just allow all routes and let the AuthContext handle redirects.

export function middleware(request: NextRequest) {
  // Allow all routes - client-side AuthContext will handle auth
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|grid.svg|.*\\.png$).*)']
}
