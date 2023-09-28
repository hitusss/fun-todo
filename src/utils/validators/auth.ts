import { z } from 'zod'

export const authSchema = z.object({
	email: z.string().email(),
})

export type AuthSchema = z.infer<typeof authSchema>
