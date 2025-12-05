import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/signin',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/notes/:path*',
    '/record/:path*',
    '/search/:path*',
    '/settings/:path*',
  ],
}

