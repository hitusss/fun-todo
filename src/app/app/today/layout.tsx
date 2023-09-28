import { Metadata } from 'next'

import { PageWrapper } from '@/components/app/page-layout'

export const metadata: Metadata = {
	title: 'Today',
	openGraph: {
		title: 'Today',
	},
	twitter: {
		title: 'Today',
	},
}
export default function Layout({ children }: { children: React.ReactNode }) {
	return <PageWrapper>{children}</PageWrapper>
}
