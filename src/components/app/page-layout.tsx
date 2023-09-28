'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { Header } from '@/components/app/header'

export function PageProvider({ children }: { children: React.ReactNode }) {
	return <AnimatePresence mode="wait">{children}</AnimatePresence>
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	return (
		<motion.main
			key={pathname}
			initial={{
				opacity: 0.5,
				translateX: '100%',
			}}
			animate={{
				opacity: 1,
				translateX: 0,
				transition: { duration: 0.5, ease: 'easeOut' },
			}}
			exit={{
				opacity: 0,
				translateX: '100%',
				transition: { duration: 0.5, ease: 'easeIn' },
			}}
			className="absolute inset-0 flex origin-right flex-col overflow-hidden border bg-background-alt p-3 text-foreground-alt shadow-md"
		>
			<Header />
			{children}
		</motion.main>
	)
}
