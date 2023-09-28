import { Metadata } from 'next'

import { PageWrapper } from '@/components/app/page-layout'

export const metadata: Metadata = {
	title: 'This Week',
	openGraph: {
		title: 'This Week',
	},
	twitter: {
		title: 'This Week',
	},
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <PageWrapper>{children}</PageWrapper>
}
