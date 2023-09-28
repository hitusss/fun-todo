import { z } from 'zod'

import { createTag, deleteTag, getTagDetails, updateTag } from '@/models/tag'
import { tagSchema } from '@/utils/validators/tag'

import { protectedProcedure, router } from '../index'

export const tagRouter = router({
	getTagDetailsById: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const tag = await getTagDetails(input)
			return tag
		}),
	createTag: protectedProcedure.input(tagSchema).mutation(async ({ input }) => {
		const tag = await createTag(input)
		return tag
	}),
	updateTag: protectedProcedure.input(tagSchema).mutation(async ({ input }) => {
		const tag = await updateTag(input)
		return tag
	}),
	deleteTag: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const tag = await deleteTag(input)
			return tag
		}),
})
