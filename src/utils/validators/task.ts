import { z } from 'zod'

export const taskSchema = z.object({
	id: z.string(),
	title: z
		.string()
		.min(3, 'Title must be at least 5 characters long')
		.max(64, 'Title must be at most 50 characters long'),
	description: z
		.string()
		.max(255, 'Description must be at most 255 characters long')
		.optional(),
	dueDate: z.coerce.date().optional(),
	isCompleted: z.boolean(),
	projectAndSection: z.tuple([z.string(), z.string().optional()]),
	tags: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			bgColor: z.string(),
			textColor: z.string(),
		}),
	),
})

export type TaskSchema = z.infer<typeof taskSchema>

export const taskCommentSchema = z.object({
	id: z.string(),
	taskId: z.string(),
	message: z.string(),
})

export type TaskCommentSchema = z.infer<typeof taskCommentSchema>
