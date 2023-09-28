'use server'

import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'

import { havePermissions } from '../utils'

export async function getTaskLogs(taskId: string) {
	const task = await prisma.task.findUnique({
		where: {
			id: taskId,
		},
		select: {
			projectId: true,
		},
	})

	if (!task) {
		throw new Error('Task not found')
	}

	await havePermissions({
		projectId: task.projectId,
		permission: 'ADMIN',
	})

	const logs = await prisma.taskLog.findMany({
		where: {
			taskId,
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

export type TaskLogs = Awaited<ReturnType<typeof getTaskLogs>>

export async function createTaskLog({
	title,
	description,
	taskId,
}: {
	title: string
	description?: string
	taskId: string
}) {
	const user = await getRequiredUser()
	return prisma.taskLog.create({
		data: {
			title,
			description,
			taskId,
			userId: user.id,
		},
	})
}
