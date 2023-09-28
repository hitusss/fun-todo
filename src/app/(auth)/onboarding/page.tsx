import { Metadata } from 'next'

import { OnboardingForm } from '@/components/auth/form'

export const metadata: Metadata = {
	title: 'Onboarding',
	openGraph: {
		title: 'Onboarding',
	},
	twitter: {
		title: 'Onboarding',
	},
}

export default function Onboarding() {
	return (
		<>
			<h2>Onboarding</h2>
			<OnboardingForm />
		</>
	)
}
