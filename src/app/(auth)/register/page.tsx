import { Metadata } from 'next'

import { AuthForm } from '@/components/auth/form'

export const metadata: Metadata = {
	title: 'Register',
	openGraph: {
		title: 'Register',
	},
	twitter: {
		title: 'Register',
	},
}

export default function Register() {
	return (
		<>
			<h2>Register</h2>
			<AuthForm />
		</>
	)
}
