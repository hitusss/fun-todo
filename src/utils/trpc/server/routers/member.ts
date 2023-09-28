import { z } from 'zod'

import {
	acceptInvite,
	cancelInvite,
	getUserInvites,
	inviteMember,
	rejectInvite,
	removeMember,
} from '@/models/member'
import { memberSchema } from '@/utils/validators/member'

import { protectedProcedure, router } from '../index'

export const memberRouter = router({
	getInvites: protectedProcedure.query(async () => {
		const invites = await getUserInvites()
		return invites
	}),
	inviteMember: protectedProcedure
		.input(memberSchema)
		.mutation(async ({ input }) => {
			const invite = inviteMember(input)
			return invite
		}),
	cancelInvite: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const invite = await cancelInvite(input)
			return invite
		}),
	acceptInvite: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const invite = await acceptInvite(input)
			return invite
		}),
	rejectInvite: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const invite = await rejectInvite(input)
			return invite
		}),
	removeMember: protectedProcedure
		.input(
			z.object({
				memberId: z.string(),
				projectId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const member = await removeMember(input)
			return member
		}),
})
