'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

import { TooltipProvider } from '@/components/ui/tooltip'

function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<ThemeProvider
				themes={['light', 'dark']}
				attribute="class"
				defaultTheme="system"
				enableSystem
			>
				<TooltipProvider>{children}</TooltipProvider>
			</ThemeProvider>
		</SessionProvider>
	)
}

export default Providers
