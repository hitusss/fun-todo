'use server'

import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'

import { havePermissions } from '../utils'

export async function getProjectLogs(projectId: string) {
	await havePermissions({
		projectId,
		permission: 'ADMIN',
	})

	const logs = await prisma.projectLog.findMany({
		where: {
			projectId,
		},
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			id: true,
			title: true,
			description: true,
			createdAt: true,
			user: {
				select: { name: true, image: true },
			},
		},
	})

	return logs
}

export type ProjectLogs = Awaited<ReturnType<typeof getProjectLogs>>

export async function createProjectLog({
	title,
	description,
	projectId,
}: {
	title: string
	description?: string
	projectId: string
}) {
	const user = await getRequiredUser()

	return prisma.projectLog.create({
		data: {
			title,
			description,
			projectId,
			userId: user.id,
		},
	})
}
