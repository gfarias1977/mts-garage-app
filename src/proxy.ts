import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/unauthorized'])
const isMechanicRoute = createRouteMatcher(['/work-orders-mechanic(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgRole } = await auth()

  // Authenticated user visiting sign-in: send to dashboard (layout will check role)
  if (userId && req.nextUrl.pathname.startsWith('/sign-in')) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // Restrict org:member to mechanic routes only
  if (userId && orgRole === 'org:member' && !isPublicRoute(req) && !isMechanicRoute(req)) {
    const url = req.nextUrl.clone()
    url.pathname = '/work-orders-mechanic'
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
