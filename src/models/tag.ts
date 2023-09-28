'use server'

import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'
import { TagSchema } from '@/utils/validators/tag'

import { createProjectLog } from './logs/project'
import { havePermissions, tagSelect } from './utils'

export async function getTagDetails(id: string) {
	const tag = await prisma.tag.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			bgColor: true,
			textColor: true,
			projectId: true,
		},
	})
	if (!tag) {
		throw new Error('Tag not found')
	}
	await havePermissions({
		projectId: tag.projectId,
		permission: 'ADMIN',
	})
	return tag
}

export type TagDetails = Awaited<ReturnType<typeof getTagDetails>>

export async function createTag({
	projectId,
	name,
	bgColor,
	textColor,
}: TagSchema) {
	await havePermissions({
		projectId,
		permission: 'ADMIN',
	})

	const tag = await prisma.tag.create({
		data: {
			name,
			bgColor,
			textColor,
			projectId,
		},
		select: tagSelect,
	})

	createProjectLog({
		title: 'Tag created',
		description: `Tag ${tag.name} created`,
		projectId,
	})

	const members = await prisma.member.findMany({
		where: {
			projectId: projectId,
		},
		select: {
			userId: true,
		},
	})

	members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'tag:created', tag)
	})

	return tag
}

export async function updateTag({
	projectId,
	id,
	name,
	bgColor,
	textColor,
}: TagSchema) {
	await havePermissions({
		projectId,
		permission: 'ADMIN',
	})

	const tag = await prisma.tag.update({
		where: {
			id,
		},
		data: {
			name,
			bgColor,
			textColor,
		},
		select: tagSelect,
	})

	createProjectLog({
		title: 'Tag updated',
		description: `Tag ${tag.name} updated`,
		projectId,
	})

	const members = await prisma.member.findMany({
		where: {
			projectId: projectId,
		},
		select: {
			userId: true,
		},
	})

	members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'tag:updated', tag)
	})

	return tag
}

export async function deleteTag(id: string) {
	const tag = await prisma.tag.findUnique({
		where: { id },
		select: {
			name: true,
			projectId: true,
		},
	})

	if (!tag) {
		throw new Error('Tag not found')
	}

	await havePermissions({
		projectId: tag.projectId,
		permission: 'ADMIN',
	})

	await prisma.tag.delete({
		where: { id },
	})

	createProjectLog({
		title: 'Tag deleted',
		description: `Tag ${tag.name} deleted`,
		projectId: tag.projectId,
	})

	const members = await prisma.member.findMany({
		where: {
			projectId: tag.projectId,
		},
		select: {
			userId: true,
		},
	})

	members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'tag:deleted', {
			id,
			projectId: tag.projectId,
		})
	})

	return {
		id,
		projectId: tag.projectId,
	}
}
