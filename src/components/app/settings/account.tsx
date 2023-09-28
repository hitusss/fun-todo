import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlusIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { api } from '@/utils/trpc/api/client'
import { UserSchema, userSchema } from '@/utils/validators/user'
import { Button, buttonVariants, StatusButton } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { UserAvatar } from '../user-avatar'

export function AccountSettings() {
	const sessions = useSession({ required: true })
	const userForm = useForm<UserSchema>({
		resolver: zodResolver(userSchema),
		mode: 'onBlur',
		defaultValues: {
			name: sessions.data?.user?.name || '',
		},
	})

	if (sessions.status === 'loading') {
		return (
			<div className="absolute grid h-full w-full place-content-center">
				<Spinner />
			</div>
		)
	}

	return (
		<div>
			<Form {...userForm}>
				<form
					onSubmit={userForm.handleSubmit(async data => {
						await api.userRouter.updateUser.mutate(data)
					})}
					className="mt-4 grid grid-cols-[auto_1fr] gap-6"
				>
					<div className="relative h-24 w-24">
						<UserAvatar
							image={userForm.watch('image') || sessions.data.user.image}
							name={userForm.watch('name')}
							size="xl"
						/>
						<input
							type="file"
							accept="image/png, image/jpeg"
							onChange={async e => {
								if (e.target.files && e.target.files[0]) {
									const reader = new FileReader()
									reader.readAsDataURL(e.target.files[0])
									reader.onload = () => {
										typeof reader.result === 'string' &&
											userForm.setValue('image', reader.result)
									}
									reader.onerror = () => userForm.setValue('image', undefined)
								}
							}}
							name="imageUploader"
							id="imageUploader"
							hidden
						/>
						<label
							htmlFor="imageUploader"
							className={buttonVariants({
								size: 'icon',
								className: 'absolute -bottom-1 -right-1',
							})}
						>
							<span className="sr-only">Upload new avatar</span>
							<ImagePlusIcon />
						</label>
					</div>
					<FormField
						control={userForm.control}
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
					<fieldset
						disabled={userForm.formState.isSubmitting}
						className="col-span-full mt-6 flex items-center justify-end gap-2"
					>
						<Button type="reset" variant="outline">
							Cancel
						</Button>
						<StatusButton
							type="submit"
							status={userForm.formState.isSubmitting ? 'loading' : undefined}
						>
							Save
						</StatusButton>
					</fieldset>
				</form>
			</Form>
		</div>
	)
}
