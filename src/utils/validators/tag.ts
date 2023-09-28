import { z } from 'zod'

export const tagSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	name: z
		.string()
		.min(3, 'Name must be at least 5 characters long')
		.max(64, 'Name must be at most 50 characters long'),
	bgColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
})

export type TagSchema = z.infer<typeof tagSchema>
