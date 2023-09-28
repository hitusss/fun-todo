import { Metadata } from 'next'

import { PageWrapper } from '@/components/app/page-layout'

export const metadata: Metadata = {
	title: 'Inbox',
	openGraph: {
		title: 'Inbox',
	},
	twitter: {
		title: 'Inbox',
	},
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <PageWrapper>{children}</PageWrapper>
}
