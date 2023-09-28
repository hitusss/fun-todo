import { z } from 'zod'

import {
	createSection,
	deleteSection,
	getSectionDetails,
	updateSection,
} from '@/models/section'
import { sectionSchema } from '@/utils/validators/section'

import { protectedProcedure, router } from '../index'

export const sectionRouter = router({
	getSectionDetailsById: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const section = await getSectionDetails(input)
			return section
		}),
	createSection: protectedProcedure
		.input(sectionSchema)
		.mutation(async ({ input }) => {
			const section = await createSection(input)
			return section
		}),
	updateSection: protectedProcedure
		.input(sectionSchema)
		.mutation(async ({ input }) => {
			const section = await updateSection(input)
			return section
		}),
	deleteSection: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const section = await deleteSection(input)
			return section
		}),
})
