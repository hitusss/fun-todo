import { z } from 'zod'

export const projectSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(3, 'Name must be at least 5 characters long')
		.max(64, 'Name must be at most 50 characters long'),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
		.optional(),
})

export type ProjectSchema = z.infer<typeof projectSchema>
