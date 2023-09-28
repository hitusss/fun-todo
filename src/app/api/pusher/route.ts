import { NextRequest, NextResponse } from 'next/server'

import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'
import { pusherServer } from '@/utils/pusher'

// export const runtime = 'edge'

async function handler(request: NextRequest) {
	const user = await getRequiredUser()

	const formData = await request.formData()
	const socket_id = formData.get('socket_id')
	const channel_name = formData.get('channel_name')

	if (typeof socket_id !== 'string' || typeof channel_name !== 'string') {
		return NextResponse.json(
			{ error: new Error('Invalid parameters') },
			{ status: 400 },
		)
	}

	if (
		channel_name.includes('-user-') ||
		channel_name.includes('-today-') ||
		channel_name.includes('-thisWeek-')
	) {
		const [, , ...userId] = channel_name.split('-')
		if (user.id !== userId.join('-')) {
			return NextResponse.json(
				{ error: new Error('Forbidden') },
				{ status: 403 },
			)
		}
	}

	if (channel_name.includes('-project-')) {
		const [, , ...projectId] = channel_name.split('-')
		const project = await prisma.project.findFirst({
			where: {
				id: projectId.join('-'),
				members: {
					some: {
						userId: user.id,
					},
				},
			},
		})

		if (!project) {
			return NextResponse.json(
				{ error: new Error('Forbidden') },
				{ status: 403 },
			)
		}
	}

	if (channel_name.includes('-task-')) {
		const [, , ...taskId] = channel_name.split('-')
		const task = await prisma.task.findUnique({
			where: {
				id: taskId.join('-'),
			},
			select: {
				projectId: true,
			},
		})

		if (!task) {
			return NextResponse.json(
				{ error: new Error('Forbidden') },
				{ status: 403 },
			)
		}

		const project = await prisma.project.findFirst({
			where: {
				id: task.projectId,
				members: {
					some: {
						userId: user.id,
					},
				},
			},
		})

		if (!project) {
			return NextResponse.json(
				{ error: new Error('Forbidden') },
				{ status: 403 },
			)
		}
	}

	const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
		user_id: user.id,
	})
	return NextResponse.json(authResponse)
}

export { handler as GET, handler as POST }
