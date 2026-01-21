import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Define public routes
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Allow next/static, images, api, etc (Already handled by matcher, but safe to ignore if passed)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Redirect logic
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
