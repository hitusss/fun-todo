'use server'

import { ProjectDisplay, TaskOrder } from 'types'
import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'
import { ProjectSchema } from '@/utils/validators/project'

import { createProjectLog } from './logs/project'
import {
	havePermissions,
	inviteSelect,
	memberSelect,
	sectionOrder,
	sectionSelect,
	taskOrder,
	taskSelect,
	userProjectSelect,
} from './utils'

export async function getUserProjects() {
	const user = await getRequiredUser()
	const userId = user.id

	const projects = await prisma.project.findMany({
		where: {
			members: {
				some: {
					userId,
				},
			},
		},
		orderBy: [
			{
				inbox: 'asc',
			},
			{ createdAt: 'asc' },
		],
		select: userProjectSelect(userId),
	})

	return projects
}

export type UserProjects = Awaited<ReturnType<typeof getUserProjects>>

export async function getProjectDetail(id: string) {
	await havePermissions({
		projectId: id,
		permission: 'ADMIN',
	})

	const project = await prisma.project.findFirst({
		where: {
			id,
		},
		select: {
			id: true,
			inbox: true,
			name: true,
			color: true,
			members: {
				select: memberSelect,
			},
			invites: {
				select: inviteSelect,
			},
		},
	})

	if (!project) {
		throw new Error('Project not found')
	}

	return project
}

export type ProjectDetail = Awaited<ReturnType<typeof getProjectDetail>>

export async function createProject({ name, color }: ProjectSchema) {
	const user = await getRequiredUser()
	const userId = user.id

	const project = await prisma.project.create({
		data: {
			name,
			color,
			members: {
				create: {
					userId,
					role: 'OWNER',
				},
			},
		},
		select: userProjectSelect(userId),
	})

	createProjectLog({
		title: 'Project created',
		projectId: project.id,
	})

	return project
}

export async function updateProject({ id, name, color }: ProjectSchema) {
	const user = await getRequiredUser()
	const userId = user.id

	await havePermissions({
		projectId: id,
		permission: 'ADMIN',
	})

	const project = await prisma.project.update({
		where: {
			id,
		},
		data: {
			name,
			color,
		},
		select: userProjectSelect(userId),
	})

	createProjectLog({
		title: 'Project updated',
		projectId: project.id,
	})

	const members = await prisma.member.findMany({
		where: {
			projectId: project.id,
		},
		select: {
			userId: true,
		},
	})

	members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'project:updated', project)
	})

	return project
}

export async function updateProjectSettings({
	id,
	data,
}: {
	id: string
	data: {
		display?: ProjectDisplay
		showCompleted?: boolean
		taskOrder?: TaskOrder
	}
}) {
	await havePermissions({
		projectId: id,
		permission: 'ADMIN',
	})

	const project = await prisma.project.update({
		where: {
			id,
		},
		data,
		select: {
			id: true,
			display: true,
			showCompleted: true,
			taskOrder: true,
		},
	})

	createProjectLog({
		title: 'Project settings updated',
		projectId: project.id,
	})

	if (data.showCompleted === true) {
		const projectWithTasks = await prisma.project.findUnique({
			where: {
				id,
			},
			select: {
				tasks: {
					where: {
						sectionId: null,
						isCompleted: true,
					},
					orderBy: taskOrder,
					select: taskSelect,
				},
				sections: {
					orderBy: sectionOrder,
					select: {
						...sectionSelect,
						tasks: {
							where: {
								isCompleted: true,
							},
							orderBy: taskOrder,
							select: taskSelect,
						},
					},
				},
			},
		})
		if (!projectWithTasks) {
			throw new Error('Project not found')
		}
		typedTrigger(
			`private-project-${id}`,
			'task:showCompleted',
			projectWithTasks,
		)
	}
	if (data.showCompleted === false) {
		typedTrigger(`private-project-${id}`, 'task:hideCompleted', null)
	}

	const members = await prisma.member.findMany({
		where: {
			projectId: id,
		},
		select: {
			userId: true,
		},
	})

	members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'projectSettings:updated', project)
	})

	return project
}

export async function deleteProject(id: string) {
	await havePermissions({
		projectId: id,
		permission: 'ADMIN',
	})

	const project = await prisma.project.delete({
		where: {
			id,
		},
		select: {
			members: {
				select: {
					userId: true,
				},
			},
		},
	})

	project.members.forEach(m => {
		typedTrigger(`private-user-${m.userId}`, 'project:deleted', id)
	})

	return id
}
