import { z } from 'zod'

export const userSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 5 characters long')
		.max(24, 'Title must be at most 24 characters long'),
	image: z.string().url().nullable().optional(),
})

export type UserSchema = z.infer<typeof userSchema>
