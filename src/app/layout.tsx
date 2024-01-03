import { openSans } from './fonts'

import '@/styles/tailwind.css'

import { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { seo } from '@/config/seo'
import { cn } from '@/utils/misc'

import Providers from './providers'

export const metadata: Metadata = seo
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body
				className={cn(openSans.variable, 'list-none overflow-hidden font-sans')}
			>
				<Providers>{children}</Providers>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
