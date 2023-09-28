'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { UserProjects } from 'types'
import { useTaskDialog } from '@/stores/task-dialog'
import { useUserProjects } from '@/stores/user-projects'
import { api } from '@/utils/trpc/api/client'
import { taskSchema, type TaskSchema } from '@/utils/validators/task'
import { Tag } from '@/components/app/tag/tag'
import { Button, StatusButton } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function TaskForm() {
	const { projects: userProjects } = useUserProjects()
	const { task, close } = useTaskDialog()
	const [tags, setTags] = React.useState<UserProjects[number]['tags']>([])
	const form = useForm<TaskSchema>({
		mode: 'onBlur',
		resolver: zodResolver(taskSchema),
		defaultValues: task,
	})

	const isNew = task.id === 'new'
	const [project] = form.watch('projectAndSection')

	React.useEffect(() => {
		setTags(userProjects.find(p => p.id === project)?.tags || [])
	}, [project, userProjects])

	const onSubmit = async (data: TaskSchema) => {
		if (isNew) {
			await api.taskRouter.createTask.mutate(data)
		} else {
			await api.taskRouter.updateTask.mutate(data)
		}

		close()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="Title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea placeholder="Description" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid gap-1 md:grid-cols-2">
					<FormField
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<DatePicker
										placeholder="Due Date"
										selected={field.value}
										onSelect={field.onChange}
										disabled={date => {
											const today = new Date()
											today.setDate(today.getDate() - 1)
											return date < today
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="tags"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Combobox
										placeholder="Tags"
										items={tags.map(tag => ({
											label: (
												<Tag
													name={tag.name}
													bgColor={tag.bgColor}
													textColor={tag.textColor}
												/>
											),
											value: tag.id,
										}))}
										multiple
										value={field.value.map(tag => tag.id)}
										setValue={value => {
											if (field.value.find(t => t.id === value)) {
												field.onChange(field.value.filter(t => t.id !== value))
											} else {
												const tag = tags.find(t => t.id === value)
												if (tag) {
													field.onChange([...field.value, tag])
												}
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="mt-4 flex flex-wrap items-center justify-between border-t-2 border-muted pt-4">
					<FormField
						name="projectAndSection"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Combobox
										items={userProjects.reduce<
											{
												label: string
												value: {
													label: JSX.Element
													value: string
												}[]
											}[]
										>((acc, project) => {
											const temp: {
												label: string
												value: {
													label: JSX.Element
													value: string
												}[]
											} = {
												label: project.name,
												value: [],
											}

											temp.value.push({
												label: (
													<div className="flex items-center gap-2 font-medium">
														<span
															className="block h-3 w-3 rounded-full"
															style={{
																backgroundColor: project.color
																	? project.color
																	: project.inbox
																	? 'hsl(var(--clr-inbox))'
																	: 'hsl(var(--clr-placeholder))',
															}}
														/>
														{project.name}
													</div>
												),
												value: [project.id, undefined].join(','),
											})

											project.sections.map(section => {
												temp.value.push({
													label: <div>{section.name}</div>,
													value: [project.id, section.id].join(','),
												})
											})

											acc.push(temp)
											return acc
										}, [])}
										value={field.value.join(',')}
										setValue={value => {
											field.onChange(value.split(','))
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<fieldset
						className="flex justify-end gap-2"
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
				</div>
			</form>
		</Form>
	)
}
