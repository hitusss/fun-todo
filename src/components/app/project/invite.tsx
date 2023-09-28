import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { api } from '@/utils/trpc/api/client'
import { MemberSchema, memberSchema } from '@/utils/validators/member'
import { Button, StatusButton } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const projectRoles = [
	{ label: 'Admin', value: 'ADMIN' },
	{ label: 'Editor', value: 'EDITOR' },
	{ label: 'Viewer', value: 'VIEWER' },
]

export function InviteMember({
	children,
	projectId,
}: {
	children: React.ReactNode
	projectId: string
}) {
	const [open, setOpen] = React.useState(false)
	const form = useForm<MemberSchema>({
		mode: 'onBlur',
		resolver: zodResolver(memberSchema),
		defaultValues: {
			projectId,
			role: 'VIEWER',
		},
	})

	const onSubmit = async (data: MemberSchema) => {
		await api.memberRouter.inviteMember.mutate(data)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="w-screen max-w-[384px]">
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input type="email" placeholder="Email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Combobox
											placeholder="Role"
											value={field.value}
											setValue={value => {
												field.onChange(
													value.toUpperCase() as MemberSchema['role'],
												)
											}}
											items={projectRoles}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<fieldset
							className="mt-6 flex justify-end gap-2"
							disabled={form.formState.isSubmitting}
						>
							<Button
								variant="outline"
								type="reset"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<StatusButton
								type="submit"
								status={form.formState.isSubmitting ? 'loading' : undefined}
							>
								Invite
							</StatusButton>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
