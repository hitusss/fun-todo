import { ProjectRole } from 'types'
import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'

const permissions = ['VIEWER', 'EDITOR', 'ADMIN', 'OWNER']

export async function havePermissions({
	projectId,
	permission,
}: {
	projectId: string
	permission: ProjectRole
}) {
	const user = await getRequiredUser()
	const userId = user.id

	const member = await prisma.member.findFirst({
		where: {
			projectId,
			userId,
		},
	})

	if (!member) {
		throw new Error('You are not a member of this project')
	}

	if (permissions.indexOf(member.role) < permissions.indexOf(permission)) {
		throw new Error('You do not have permission to perform this action')
	}

	return true
}

export type SortOrder = 'asc' | 'desc'
export type OrderBy = Array<Record<string, SortOrder>>

export const projectSelect = {
	id: true,
	inbox: true,
	name: true,
	color: true,
	display: true,
	showCompleted: true,
	taskOrder: true,
}

export const userProjectSelect = (userId: string) => ({
	...projectSelect,
	members: {
		where: {
			userId,
		},
		select: {
			role: true,
		},
	},
	sections: {
		select: {
			id: true,
			name: true,
		},
	},
	tags: {
		select: tagSelect,
	},
})

export const taskOrder: OrderBy = [{ isCompleted: 'asc' }, { createdAt: 'asc' }]

export const taskSelect = {
	id: true,
	title: true,
	description: true,
	isCompleted: true,
	dueDate: true,
	tags: true,
	projectId: true,
	sectionId: true,
	order: true,
	createdAt: true,
	taskComment: {
		select: {
			id: true,
		},
	},
}

export const sectionOrder: OrderBy = [{ order: 'asc' }, { createdAt: 'asc' }]

export const sectionSelect = {
	id: true,
	name: true,
	order: true,
	projectId: true,
	createdAt: true,
	tasks: {
		orderBy: taskOrder,
		select: taskSelect,
	},
}

export const tagSelect = {
	id: true,
	name: true,
	bgColor: true,
	textColor: true,
	projectId: true,
}

export const memberSelect = {
	role: true,
	user: {
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
	},
}

export const inviteSelect = {
	id: true,
	role: true,
	user: {
		select: {
			name: true,
			image: true,
		},
	},
	inviter: {
		select: {
			name: true,
			image: true,
		},
	},
}
