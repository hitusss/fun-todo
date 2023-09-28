import { z } from 'zod'

import {
	createProject,
	getProjectDetail,
	updateProject,
	updateProjectSettings,
} from '@/models/project'
import { projectSchema } from '@/utils/validators/project'

import { protectedProcedure, router } from '../index'

export const projectRouter = router({
	getProjectDetailById: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const project = await getProjectDetail(input)
			return project
		}),
	createProject: protectedProcedure
		.input(projectSchema)
		.mutation(async ({ input }) => {
			const project = await createProject(input)
			return project
		}),
	updateProject: protectedProcedure
		.input(projectSchema)
		.mutation(async ({ input }) => {
			const project = await updateProject(input)
			return project
		}),
	updateProjectSettings: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: z.object({
					display: z.enum(['LIST', 'BOARD']).optional(),
					showCompleted: z.boolean().optional(),
					taskOrder: z.enum(['CUSTOM', 'DUEDATE']).optional(),
				}),
			}),
		)
		.mutation(async ({ input }) => {
			const project = await updateProjectSettings(input)
			return project
		}),
})
