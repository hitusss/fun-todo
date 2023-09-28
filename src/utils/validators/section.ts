import { z } from 'zod'

export const sectionSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	order: z.number(),
	name: z
		.string()
		.min(3, 'Name must be at least 5 characters long')
		.max(64, 'Name must be at most 50 characters long'),
})

export type SectionSchema = z.infer<typeof sectionSchema>
