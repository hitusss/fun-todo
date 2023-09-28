'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TrashIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useConfirmDialog } from '@/stores/confirm-dialog'
import { useSectionDialog } from '@/stores/section-dialog'
import { api } from '@/utils/trpc/api/client'
import { SectionSchema, sectionSchema } from '@/utils/validators/section'
import { Button, StatusButton } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function SectionForm() {
	const { section, close } = useSectionDialog()
	const { open: openConfirmDialog } = useConfirmDialog()
	const form = useForm<SectionSchema>({
		mode: 'onBlur',
		resolver: zodResolver(sectionSchema),
		defaultValues: section,
	})

	const isNew = section.id === 'new'

	const onSubmit = async (data: SectionSchema) => {
		if (isNew) {
			await api.sectionRouter.createSection.mutate(data)
		} else {
			await api.sectionRouter.updateSection.mutate(data)
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
				<fieldset
					className="mt-6 flex justify-end gap-2"
					disabled={form.formState.isSubmitting}
				>
					{!isNew ? (
						<Button
							variant="destructive"
							onClick={() =>
								openConfirmDialog({
									title: 'Are you sure you want to delete this section?',
									confirmHandler: async () => {
										await api.sectionRouter.deleteSection.mutate(section.id)
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
