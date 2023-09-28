import { z } from 'zod'

import { havePermissions, sectionOrder, taskOrder } from '@/models/utils'
import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'

import { protectedProcedure, router } from '../index'

export const reorderRouter = router({
	reorder: protectedProcedure
		.input(
			z.discriminatedUnion('type', [
				z.object({
					projectId: z.string(),
					type: z.literal('section'),
					id: z.string(),
					order: z.number(),
				}),
				z.object({
					projectId: z.string(),
					type: z.literal('task'),
					id: z.string(),
					sectionId: z.string(),
					order: z.number(),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const user = await getRequiredUser()
			await havePermissions({
				projectId: input.projectId,
				permission: 'EDITOR',
			})
			switch (input.type) {
				case 'section': {
					const sections = await prisma.section.findMany({
						where: {
							projectId: input.projectId,
						},
						select: {
							id: true,
						},
						orderBy: sectionOrder,
					})
					const sectionIndex = sections.findIndex(s => s.id === input.id)
					const [removed] = sections.splice(sectionIndex, 1)
					sections.splice(input.order, 0, removed)
					sections.forEach(async (section, index) => {
						await prisma.section.update({
							where: {
								id: section.id,
							},
							data: {
								order: index,
							},
						})
					})
					typedTrigger(`private-project-${input.projectId}`, 'reorder', {
						senderId: user.id,
						type: 'section',
						id: input.id,
						order: input.order,
					})
					break
				}
				case 'task': {
					const task = await prisma.task.findUnique({
						where: {
							id: input.id,
							projectId: input.projectId,
						},
						select: {
							id: true,
							sectionId: true,
						},
					})
					const section = await prisma.section.findUnique({
						where: {
							id: input.sectionId,
							projectId: input.projectId,
						},
						select: {
							tasks: {
								orderBy: taskOrder,
								select: {
									id: true,
								},
							},
						},
					})
					if (!task || !section) {
						throw new Error('Invalid task or section')
					}
					const tasks = section.tasks
					if (task.sectionId === input.sectionId) {
						const taskIndex = tasks.findIndex(t => t.id === input.id)
						tasks.splice(taskIndex, 1)
					}

					tasks.splice(input.order, 0, task)
					tasks.forEach(async (task, index) => {
						await prisma.task.update({
							where: {
								id: task.id,
							},
							data: {
								order: index,
								sectionId: input.sectionId,
							},
						})
					})

					typedTrigger(`private-project-${input.projectId}`, 'reorder', {
						senderId: user.id,
						type: 'task',
						id: input.id,
						sourceSectionId: task.sectionId || '',
						destinationSectionId: input.sectionId || '',
						order: input.order,
					})
					break
				}
				default:
					throw new Error('Invalid type')
			}
		}),
})
