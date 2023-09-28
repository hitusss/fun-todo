'use server'

import { ProjectRole } from 'types'
import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'

import { createProjectLog } from './logs/project'
import { createNotification } from './notification'
import { havePermissions, inviteSelect, userProjectSelect } from './utils'

export async function getUserInvites() {
	const user = await getRequiredUser()
	const userId = user.id

	const invites = await prisma.projectInvite.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: 'asc',
		},
		select: {
			id: true,
			createdAt: true,
			role: true,
			project: {
				select: {
					name: true,
					color: true,
				},
			},
			inviter: {
				select: {
					name: true,
					image: true,
				},
			},
		},
	})

	return invites
}

export type UserInvites = Awaited<ReturnType<typeof getUserInvites>>

export async function inviteMember({
	email,
	projectId,
	role,
}: {
	email: string
	projectId: string
	role: ProjectRole
}) {
	await havePermissions({
		projectId,
		permission: 'ADMIN',
	})
	const user = await getRequiredUser()
	const userId = user.id

	const projectToInvite = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
		select: {
			name: true,
		},
	})

	if (!projectToInvite) {
		throw new Error('Project not found')
	}

	const userToInvite = await prisma.user.findUnique({
		where: {
			email,
		},
		select: {
			id: true,
		},
	})

	if (!userToInvite) {
		throw new Error('User not found')
	}

	const invite = await prisma.projectInvite.create({
		data: {
			projectId,
			userId: userToInvite.id,
			inviterId: userId,
			role,
		},
		select: inviteSelect,
	})

	createProjectLog({
		title: 'Invite member',
		description: `Invited ${email} to join project with role ${role}.`,
		projectId,
	})

	createNotification({
		userId: userToInvite.id,
		title: 'You have been invited to a project',
		description: `You have been invited to join ${projectToInvite.name} project.`,
	})

	typedTrigger(`private-project-${projectId}`, 'projectInvite:created', invite)

	return invite
}

export async function cancelInvite(id: string) {
	const invite = await prisma.projectInvite.findUnique({
		where: {
			id,
		},
		select: {
			projectId: true,
			user: {
				select: {
					id: true,
					email: true,
				},
			},
			project: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

	if (!invite) {
		throw new Error('Invite not found')
	}

	await havePermissions({
		projectId: invite.projectId,
		permission: 'ADMIN',
	})

	await prisma.projectInvite.delete({
		where: {
			id,
		},
	})

	createProjectLog({
		title: 'Cancel invite',
		description: `Cancelled invite to ${invite.user.email} to join project.`,
		projectId: invite.project.id,
	})

	createNotification({
		userId: invite.user.id,
		title: 'Your invite to a project has been cancelled',
		description: `Your invite to join ${invite.project.name} project has been cancelled.`,
	})

	typedTrigger(
		`private-project-${invite.projectId}`,
		'projectInvite:deleted',
		id,
	)

	return id
}

export async function acceptInvite(id: string) {
	const user = await getRequiredUser()
	const userId = user.id

	const invite = await prisma.projectInvite.findFirst({
		where: {
			id,
			userId,
		},
		select: {
			projectId: true,
			role: true,
		},
	})

	if (!invite) {
		throw new Error('Invite not found')
	}

	await prisma.member.create({
		data: {
			projectId: invite.projectId,
			userId,
			role: invite.role,
		},
	})

	const project = await prisma.project.findUnique({
		where: {
			id: invite.projectId,
		},
		select: userProjectSelect(userId),
	})

	if (!project) {
		throw new Error('Project not found')
	}

	typedTrigger(`private-user-${userId}`, 'project:created', project)

	await prisma.projectInvite.delete({
		where: {
			id,
		},
	})

	createProjectLog({
		title: 'Accept invite',
		description: `Accepted invite to join project.`,
		projectId: invite.projectId,
	})

	typedTrigger(
		`private-project-${invite.projectId}`,
		'projectInvite:deleted',
		id,
	)

	return id
}

export async function rejectInvite(id: string) {
	const user = await getRequiredUser()
	const userId = user.id

	const invite = await prisma.projectInvite.findFirst({
		where: {
			id,
			userId,
		},
		select: {
			projectId: true,
		},
	})

	if (!invite) {
		throw new Error('Invite not found')
	}

	await prisma.projectInvite.delete({
		where: {
			id,
		},
	})

	typedTrigger(
		`private-project-${invite.projectId}`,
		'projectInvite:deleted',
		id,
	)

	return id
}

export async function removeMember({
	memberId,
	projectId,
}: {
	memberId: string
	projectId: string
}) {
	await havePermissions({
		projectId,
		permission: 'ADMIN',
	})

	await prisma.member.delete({
		where: {
			userId_projectId: {
				userId: memberId,
				projectId,
			},
		},
	})

	typedTrigger(
		`private-project-${projectId}`,
		'projectMember:deleted',
		memberId,
	)

	return memberId
}
