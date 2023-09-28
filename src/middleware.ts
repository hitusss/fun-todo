import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
	async function middleware(req) {
		const token = await getToken({ req })
		const isAuth = !!token?.id
		const isAuthPage =
			req.nextUrl.pathname.startsWith('/login') ||
			req.nextUrl.pathname.startsWith('/register')
		const isOnboardingPage = req.nextUrl.pathname.startsWith('/onboarding')

		if (isAuthPage) {
			if (isAuth) {
				return NextResponse.redirect(new URL('/app', req.url))
			}

			return null
		}

		if (isOnboardingPage) {
			if (isAuth && token.name) {
				return NextResponse.redirect(new URL('/app', req.url))
			}

			return null
		}

		let from = req.nextUrl.pathname
		if (req.nextUrl.search) {
			from += req.nextUrl.search
		}
		if (!isAuth) {
			return NextResponse.redirect(
				new URL(`/login?from=${encodeURIComponent(from)}`, req.url),
			)
		}
		if (!token.name) {
			return NextResponse.redirect(
				new URL(`/onboarding?from=${encodeURIComponent(from)}`, req.url),
			)
		}

		if (req.nextUrl.pathname.endsWith('/app')) {
			return NextResponse.redirect(new URL('/app/inbox', req.url))
		}
	},
	{
		callbacks: {
			async authorized() {
				// This is a work-around for handling redirect on auth pages.
				// We return true here so that the middleware function above
				// is always called.
				return true
			},
		},
	},
)

export const config = {
	matcher: ['/app/:path*', '/login', '/register', '/onboarding'],
}
