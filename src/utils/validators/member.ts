import { z } from 'zod'

export const memberSchema = z.object({
	projectId: z.string(),
	email: z.string().email(),
	role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
})

export type MemberSchema = z.infer<typeof memberSchema>
