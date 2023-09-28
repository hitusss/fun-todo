'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { Logo } from '@/components/ui/logo'

export default function Home() {
	const session = useSession()
	return (
		<>
			<header className="flex items-center justify-between px-6 py-2 lg:px-12">
				<h1 aria-label="fun todo logo">
					<Logo />
				</h1>
				<nav className="flex items-center gap-3">
					{session.status === 'authenticated' ? (
						<>
							<Link href="/app">Go to App</Link>
						</>
					) : (
						<>
							<Link href="/login">Login</Link>
						</>
					)}
				</nav>
			</header>
		</>
	)
}
