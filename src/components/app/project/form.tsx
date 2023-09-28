'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useProjectDialog } from '@/stores/project-dialog'
import { useUserProjects } from '@/stores/user-projects'
import { api } from '@/utils/trpc/api/client'
import { projectSchema, type ProjectSchema } from '@/utils/validators/project'
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

export function ProjectForm() {
	const router = useRouter()

	const {
		project: { id, name, color },
		close,
	} = useProjectDialog()

	const form = useForm<ProjectSchema>({
		mode: 'onBlur',
		resolver: zodResolver(projectSchema),
		defaultValues: {
			id,
			name,
			color,
		},
	})

	const isNew = id === 'new'

	const onSubmit = async (data: ProjectSchema) => {
		if (isNew) {
			const res = await api.projectRouter.createProject.mutate(data)
			useUserProjects.getState().addProject(res)
			router.push(`/app/project/${res.id}`)
			close()
		} else {
			await api.projectRouter.updateProject.mutate(data)
		}
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
					name="color"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center gap-2">
								<FormLabel>Color</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<fieldset
					className="mt-6 flex items-center justify-end gap-2"
					disabled={form.formState.isSubmitting}
				>
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
