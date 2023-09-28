import { Metadata } from 'next'

import { PageWrapper } from '@/components/app/page-layout'

export const metadata: Metadata = {
	title: 'Project',
	openGraph: {
		title: 'Project',
	},
	twitter: {
		title: 'Project',
	},
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <PageWrapper>{children}</PageWrapper>
}
