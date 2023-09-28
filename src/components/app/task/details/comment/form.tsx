import { zodResolver } from '@hookform/resolvers/zod'
import { SendIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { cn } from '@/utils/misc'
import { TaskCommentSchema, taskCommentSchema } from '@/utils/validators/task'
import { IconButton } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export function TaskCommentForm({
	defaultValues,
	onSubmit,
	className,
}: {
	defaultValues: TaskCommentSchema
	onSubmit: (data: TaskCommentSchema) => void | Promise<void>
	className?: string
}) {
	const form = useForm<TaskCommentSchema>({
		resolver: zodResolver(taskCommentSchema),
		defaultValues,
	})
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(async data => {
					await onSubmit(data)
					form.reset()
				})}
				className={cn('flex items-center gap-1', className)}
			>
				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem className="flex-1">
							<FormControl>
								<Textarea
									minRows={2}
									maxRows={2}
									placeholder="Type here your comment..."
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<IconButton
					variant="ghostPrimary"
					type="submit"
					disabled={form.formState.isSubmitting}
					label={'Send'}
					className="h-12 w-12"
				>
					{form.formState.isSubmitting ? (
						<Spinner className="h-5 w-5" />
					) : (
						<SendIcon width={20} height={20} />
					)}
				</IconButton>
			</form>
		</Form>
	)
}
