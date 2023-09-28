import { Metadata } from 'next'

import { AuthForm } from '@/components/auth/form'

export const metadata: Metadata = {
	title: 'Login',
	openGraph: {
		title: 'Login',
	},
	twitter: {
		title: 'Login',
	},
}

export default function Login() {
	return (
		<>
			<h2>Login</h2>
			<AuthForm />
		</>
	)
}
