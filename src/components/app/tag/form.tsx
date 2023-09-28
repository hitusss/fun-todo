'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TrashIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useConfirmDialog } from '@/stores/confirm-dialog'
import { useTagDialog } from '@/stores/tag-dialog'
import { api } from '@/utils/trpc/api/client'
import { TagSchema, tagSchema } from '@/utils/validators/tag'
import { Button, StatusButton } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Tag } from './tag'

export function TagForm() {
	const { tag, close } = useTagDialog()
	const { open: openConfirmDialog } = useConfirmDialog()
	const form = useForm<TagSchema>({
		mode: 'onBlur',
		resolver: zodResolver(tagSchema),
		defaultValues: tag,
	})

	const isNew = tag.id === 'new'

	const onSubmit = async (data: TagSchema) => {
		if (isNew) {
			await api.tagRouter.createTag.mutate(data)
		} else {
			await api.tagRouter.updateTag.mutate(data)
		}
		close()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="Name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bgColor"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center gap-2">
								<FormLabel>Background Color</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="textColor"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center gap-2">
								<FormLabel>Text Color</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-col items-start gap-2">
					Preview
					<Tag
						name={form.watch('name')}
						bgColor={form.watch('bgColor')}
						textColor={form.watch('textColor')}
					/>
				</div>

				<fieldset
					className="mt-6 flex justify-end gap-2"
					disabled={form.formState.isSubmitting}
				>
					{!isNew ? (
						<Button
							variant="destructive"
							onClick={() =>
								openConfirmDialog({
									title: 'Are you sure you want to delete this task?',
									confirmHandler: async () => {
										await api.tagRouter.deleteTag.mutate(tag.id)
										close()
									},
								})
							}
							type="button"
						>
							<TrashIcon width={16} height={16} /> Delete
						</Button>
					) : null}
					<Button variant="outline" type="reset" onClick={close}>
						Cancel
					</Button>
					<StatusButton
						type="submit"
						status={form.formState.isSubmitting ? 'loading' : undefined}
					>
						{isNew ? 'Create' : 'Save'}
					</StatusButton>
				</fieldset>
			</form>
		</Form>
	)
}
