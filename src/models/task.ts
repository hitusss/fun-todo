'use server'

import { format } from 'date-fns'

import { getRequiredUser } from '@/utils/auth'
import { isThisWeek, isToday, thisWeekDate, todayDate } from '@/utils/misc'
import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'
import { TaskCommentSchema, TaskSchema } from '@/utils/validators/task'

import { createTaskLog } from './logs/task'
import {
	havePermissions,
	sectionOrder,
	sectionSelect,
	tagSelect,
	taskOrder,
	taskSelect,
} from './utils'

export async function getInboxTasks() {
	const user = await getRequiredUser()
	const userId = user.id

	const project = await prisma.project.findUnique({
		where: {
			inbox: userId,
		},
		select: {
			id: true,
			showCompleted: true,
			tasks: {
				where: {
					sectionId: null,
				},
				orderBy: taskOrder,
				select: taskSelect,
			},
			sections: {
				orderBy: sectionOrder,
				select: sectionSelect,
			},
		},
	})

	if (!project) {
		throw new Error('Inbox not found')
	}

	if (project.showCompleted) {
		return project
	} else {
		return {
			...project,
			tasks: project.tasks.filter(task => !task.isCompleted),
			sections: project.sections.map(section => ({
				...section,
				tasks: section.tasks.filter(task => !task.isCompleted),
			})),
		}
	}
}

export async function getTodayTasks() {
	const user = await getRequiredUser()
	const userId = user.id

	const { startOfDay, endOfDay } = todayDate()

	const tasks = await prisma.project.findMany({
		where: {
			members: {
				some: {
					userId,
				},
			},
		},
		select: {
			tasks: {
				where: {
					dueDate: {
						gte: startOfDay,
						lte: endOfDay,
					},
				},
				orderBy: { createdAt: 'asc' },
				select: taskSelect,
			},
		},
	})

	return tasks.reduce<(typeof tasks)[number]['tasks']>((acc, project) => {
		acc.push(...project.tasks)
		return acc
	}, [])
}

export async function getThisWeekTasks() {
	const user = await getRequiredUser()
	const userId = user.id

	const { startOfWeek, endOfWeek } = thisWeekDate()

	const tasks = await prisma.project.findMany({
		where: {
			members: {
				some: {
					userId,
				},
			},
		},
		select: {
			tasks: {
				where: {
					dueDate: {
						gte: startOfWeek,
						lte: endOfWeek,
					},
				},
				orderBy: { createdAt: 'asc' },
				select: taskSelect,
			},
		},
	})

	return tasks.reduce<(typeof tasks)[number]['tasks']>((acc, project) => {
		acc.push(...project.tasks)
		return acc
	}, [])
}

export async function getProjectTasks(projectId: string) {
	await havePermissions({
		projectId,
		permission: 'VIEWER',
	})

	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
		select: {
			id: true,
			name: true,
			showCompleted: true,
			tasks: {
				where: {
					sectionId: null,
				},
				orderBy: taskOrder,
				select: taskSelect,
			},
			sections: {
				orderBy: sectionOrder,
				select: sectionSelect,
			},
		},
	})

	if (!project) {
		throw new Error('Project not found')
	}

	if (project.showCompleted) {
		return project
	} else {
		return {
			...project,
			tasks: project.tasks.filter(task => !task.isCompleted),
			sections: project.sections.map(section => ({
				...section,
				tasks: section.tasks.filter(task => !task.isCompleted),
			})),
		}
	}
}

export type ProjectWithTasks = Awaited<ReturnType<typeof getProjectTasks>>

export async function getTaskDetails(id: string) {
	const task = await prisma.task.findUnique({
		where: {
			id,
		},
		select: {
			id: true,
			title: true,
			description: true,
			dueDate: true,
			isCompleted: true,
			projectId: true,
			sectionId: true,
			tags: {
				select: tagSelect,
			},
		},
	})

	if (!task) {
		throw new Error('Task not found')
	}

	await havePermissions({
		projectId: task.projectId,
		permission: 'VIEWER',
	})

	return task
}

export type TaskDetails = Awaited<ReturnType<typeof getTaskDetails>>

export async function createTask({
	title,
	description,
	dueDate,
	isCompleted,
	projectAndSection,
	tags,
}: TaskSchema) {
	const [projectId, sectionId] = projectAndSection

	await havePermissions({
		projectId,
		permission: 'EDITOR',
	})

	const task = await prisma.task.create({
		data: {
			title,
			description,
			dueDate: dueDate ? new Date(format(dueDate, 'yyyy-MM-dd')) : undefined,
			isCompleted,
			projectId,
			sectionId,
			tags: {
				connect: tags.map(tag => ({
					id: tag.id,
				})),
			},
		},
		select: taskSelect,
	})

	createTaskLog({
		title: 'Task created',
		taskId: task.id,
	})

	typedTrigger(`private-project-${task.projectId}`, 'task:created', task)

	const projectMembers = await prisma.project.findUnique({
		where: {
			id: task.projectId,
		},
		select: {
			members: {
				select: {
					userId: true,
				},
			},
		},
	})

	if (isToday(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-today-${member.userId}`, 'task:created', task)
		})
	}
	if (isThisWeek(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-thisWeek-${member.userId}`, 'task:created', task)
		})
	}

	return task
}

export async function updateTask({
	id,
	title,
	description,
	dueDate,
	isCompleted,
	projectAndSection,
	tags,
}: TaskSchema) {
	const [projectId, sectionId] = projectAndSection

	await havePermissions({
		projectId,
		permission: 'EDITOR',
	})

	const prevTask = await prisma.task.findUnique({
		where: {
			id,
		},
		select: {
			dueDate: true,
		},
	})

	const task = await prisma.task.update({
		where: {
			id,
		},
		data: {
			title,
			description,
			dueDate: dueDate ? new Date(format(dueDate, 'yyyy-MM-dd')) : undefined,
			isCompleted,
			projectId,
			sectionId,
			tags: {
				set: tags.map(tag => ({
					id: tag.id,
				})),
			},
		},
		select: taskSelect,
	})

	createTaskLog({
		title: 'Task updated',
		taskId: task.id,
	})

	typedTrigger(`private-project-${task.projectId}`, 'task:updated', task)

	const projectMembers = await prisma.project.findUnique({
		where: {
			id: task.projectId,
		},
		select: {
			members: {
				select: {
					userId: true,
				},
			},
		},
	})

	if (isToday(prevTask?.dueDate) || isToday(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-today-${member.userId}`, 'task:updated', task)
		})
	}
	if (isThisWeek(prevTask?.dueDate) || isThisWeek(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-thisWeek-${member.userId}`, 'task:updated', task)
		})
	}

	return task
}

export async function toggleCompleteTask(id: string) {
	const task = await prisma.task.findUnique({
		where: {
			id,
		},
	})

	if (!task) {
		throw new Error('Task not found')
	}

	await havePermissions({
		projectId: task.projectId,
		permission: 'EDITOR',
	})

	const updatedTask = await prisma.task.update({
		where: {
			id,
		},
		data: {
			isCompleted: !task.isCompleted,
		},
		select: taskSelect,
	})

	createTaskLog({
		title: task.isCompleted ? 'Task completed' : 'Task uncompleted',
		taskId: task.id,
	})

	typedTrigger(
		`private-project-${updatedTask.projectId}`,
		'task:updated',
		updatedTask,
	)

	const projectMembers = await prisma.project.findUnique({
		where: {
			id: task.projectId,
		},
		select: {
			members: {
				select: {
					userId: true,
				},
			},
		},
	})

	if (isToday(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(
				`private-today-${member.userId}`,
				'task:updated',
				updatedTask,
			)
		})
	}
	if (isThisWeek(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(
				`private-thisWeek-${member.userId}`,
				'task:updated',
				updatedTask,
			)
		})
	}

	return updateTask
}

export async function deleteTask(id: string) {
	const task = await prisma.task.findUnique({
		where: {
			id,
		},
		select: {
			projectId: true,
			dueDate: true,
		},
	})

	if (!task) {
		throw new Error('Task not found')
	}

	await havePermissions({
		projectId: task.projectId,
		permission: 'EDITOR',
	})

	await prisma.task.delete({
		where: {
			id,
		},
	})

	typedTrigger(`private-project-${task.projectId}`, 'task:deleted', id)

	const projectMembers = await prisma.project.findUnique({
		where: {
			id: task.projectId,
		},
		select: {
			members: {
				select: {
					userId: true,
				},
			},
		},
	})

	if (isToday(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-today-${member.userId}`, 'task:deleted', id)
		})
	}
	if (isThisWeek(task.dueDate)) {
		projectMembers?.members.forEach(member => {
			typedTrigger(`private-thisWeek-${member.userId}`, 'task:deleted', id)
		})
	}

	return id
}

export async function getTaskComments(taskId: string) {
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
		permission: 'VIEWER',
	})

	const comments = await prisma.taskComment.findMany({
		where: {
			taskId,
		},
		select: {
			id: true,
			message: true,
			createdAt: true,
			taskId: true,
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})

	return comments
}

export type TaskComments = Awaited<ReturnType<typeof getTaskComments>>

export async function createTaskComment({
	taskId,
	message,
}: TaskCommentSchema) {
	const user = await getRequiredUser()

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
		permission: 'EDITOR',
	})

	const comment = await prisma.taskComment.create({
		data: {
			message,
			taskId,
			userId: user.id,
		},
		select: {
			id: true,
			message: true,
			createdAt: true,
			taskId: true,
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})

	createTaskLog({
		title: 'Task comment created',
		description: message,
		taskId,
	})

	typedTrigger(`private-task-${taskId}`, 'taskComment:created', comment)

	return comment
}

export async function updateTaskComment({
	id,
	taskId,
	message,
}: TaskCommentSchema) {
	const user = await getRequiredUser()

	const comment = await prisma.taskComment.findUnique({
		where: { id },
		select: { message: true, userId: true },
	})

	if (!comment) {
		throw new Error('Comment not found')
	}

	if (comment.userId !== user.id) {
		throw new Error('You do not have permission to edit this comment')
	}

	const updatedComment = await prisma.taskComment.update({
		where: {
			id,
		},
		data: {
			message,
		},
		select: {
			id: true,
			message: true,
			createdAt: true,
			taskId: true,
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})

	createTaskLog({
		title: 'Task comment updated',
		description: `${comment.message} -> ${message}`,
		taskId,
	})

	typedTrigger(`private-task-${taskId}`, 'taskComment:updated', updatedComment)

	return comment
}

export async function deleteTaskComment(id: string) {
	const user = await getRequiredUser()

	const comment = await prisma.taskComment.findUnique({
		where: {
			id,
		},
		select: {
			message: true,
			user: {
				select: {
					id: true,
				},
			},
			task: {
				select: {
					id: true,
					projectId: true,
				},
			},
		},
	})

	if (!comment) {
		throw new Error('Comment not found')
	}

	if (comment.user.id !== user.id) {
		await havePermissions({
			projectId: comment.task.projectId,
			permission: 'ADMIN',
		})
	}

	await prisma.taskComment.delete({
		where: {
			id,
		},
	})

	createTaskLog({
		title: 'Task comment deleted',
		description: comment.message,
		taskId: comment.task.id,
	})

	typedTrigger(`private-task-${comment.task.id}`, 'taskComment:deleted', id)

	return id
}
