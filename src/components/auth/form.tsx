'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { api } from '@/utils/trpc/api/client'
import { AuthSchema, authSchema } from '@/utils/validators/auth'
import { UserSchema, userSchema } from '@/utils/validators/user'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function AuthForm() {
	const searchParams = useSearchParams()
	const form = useForm<AuthSchema>({
		resolver: zodResolver(authSchema),
		mode: 'onBlur',
	})
	return (
		<div className="space-y-6">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(data =>
						signIn('email', {
							email: data.email,
							redirect: false,
							callbackUrl: searchParams?.get('from') || '/app',
						}),
					)}
					className="space-y-2"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
						className="w-full"
					>
						Login with Email
					</Button>
				</form>
			</Form>
			<span className="flex items-center gap-3 before:block before:h-px before:flex-1 before:bg-primary before:content-[''] after:block after:h-px after:flex-1 after:bg-primary after:content-['']">
				or
			</span>
			<div className="space-y-2 [&>*]:w-full">
				<Button
					className="bg-[#5865F2] text-[#FFFFFF]"
					onClick={() => signIn('discord')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 127.14 96.36"
						fill="#ffffff"
						className="h-5"
					>
						<g id="图层_2" data-name="图层 2">
							<g id="Discord_Logos" data-name="Discord Logos">
								<g
									id="Discord_Logo_-_Large_-_White"
									data-name="Discord Logo - Large - White"
								>
									<path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
								</g>
							</g>
						</g>
					</svg>
					Discord
				</Button>
			</div>
		</div>
	)
}

export function OnboardingForm() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const { update } = useSession()
	const form = useForm<UserSchema>({
		resolver: zodResolver(userSchema),
		mode: 'onBlur',
		defaultValues: {
			name: '',
		},
	})

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(async data => {
					const res = await api.userRouter.onboarding.mutate(data)
					await update({ name: res.name })
					router.push(searchParams?.get('from') || '/app')
				})}
				className="space-y-2"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					disabled={form.formState.isSubmitting}
					className="w-full"
				>
					Submit
				</Button>
				<Button
					type="button"
					variant="destructive"
					disabled={form.formState.isSubmitting}
					className="w-full"
					onClick={() => signOut()}
				>
					Sign Out
				</Button>
			</form>
		</Form>
	)
}
