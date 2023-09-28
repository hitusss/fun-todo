'use server'

import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'
import { SectionSchema } from '@/utils/validators/section'

import { createProjectLog } from './logs/project'
import { havePermissions, sectionOrder, sectionSelect } from './utils'

export async function getSectionDetails(id: string) {
	const section = await prisma.section.findUnique({
		where: {
			id,
		},
		select: {
			id: true,
			name: true,
			projectId: true,
		},
	})
	if (!section) {
		throw new Error('Section not found')
	}
	await havePermissions({
		projectId: section.projectId,
		permission: 'ADMIN',
	})
	return section
}

export type SectionDetails = Awaited<ReturnType<typeof getSectionDetails>>

export async function createSection({ projectId, name, order }: SectionSchema) {
	await havePermissions({
		projectId,
		permission: 'EDITOR',
	})

	const sections = await prisma.section.findMany({
		where: {
			projectId,
		},
		select: {
			id: true,
			order: true,
		},
		orderBy: sectionOrder,
	})

	sections.forEach(async (s, i) => {
		if (i >= order) {
			await prisma.section.update({
				where: {
					id: s.id,
				},
				data: {
					order: i + 1,
				},
			})
		}
	})

	const section = await prisma.section.create({
		data: {
			name,
			projectId,
			order,
		},
		select: sectionSelect,
	})

	createProjectLog({
		title: 'Section created',
		description: `Section ${section.name} created`,
		projectId,
	})

	typedTrigger(`private-project-${projectId}`, 'section:created', section)

	return section
}

export async function updateSection({ projectId, id, name }: SectionSchema) {
	await havePermissions({
		projectId,
		permission: 'EDITOR',
	})

	const section = await prisma.section.update({
		where: {
			id,
		},
		data: {
			name,
		},
		select: {
			...sectionSelect,
			tasks: false,
		},
	})

	createProjectLog({
		title: 'Section updated',
		description: `Section ${section.name} updated`,
		projectId,
	})

	typedTrigger(`private-project-${projectId}`, 'section:updated', section)

	return section
}

export async function deleteSection(id: string) {
	const section = await prisma.section.findUnique({
		where: {
			id,
		},
		select: {
			name: true,
			projectId: true,
		},
	})

	if (!section) {
		throw new Error('Section not found')
	}

	await havePermissions({
		projectId: section.projectId,
		permission: 'EDITOR',
	})

	await prisma.section.delete({
		where: {
			id,
		},
	})

	createProjectLog({
		title: 'Section deleted',
		description: `Section ${section.name} deleted`,
		projectId: section.projectId,
	})

	typedTrigger(`private-project-${section.projectId}`, 'section:deleted', id)

	return id
}
