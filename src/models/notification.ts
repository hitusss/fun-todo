'use server'

import { getRequiredUser } from '@/utils/auth'
import { prisma } from '@/utils/prisma'
import { typedTrigger } from '@/utils/pusher'

export async function getUserNotifications() {
	const user = await getRequiredUser()

	const notifications = await prisma.notification.findMany({
		where: {
			userId: user.id,
		},
		select: {
			id: true,
			createdAt: true,
			title: true,
			description: true,
			read: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return notifications
}

export type UserNotifications = Awaited<ReturnType<typeof getUserNotifications>>

export async function createNotification({
	userId,
	title,
	description,
}: {
	userId: string
	title: string
	description: string
}) {
	const notification = await prisma.notification.create({
		data: {
			userId,
			title,
			description,
		},
		select: {
			id: true,
			createdAt: true,
			title: true,
			description: true,
			read: true,
		},
	})

	typedTrigger(`private-user-${userId}`, 'notification:created', notification)

	return notification
}

export async function markNotificationAsRead(notificationId: string) {
	const user = await getRequiredUser()

	await prisma.notification.update({
		where: {
			id: notificationId,
			userId: user.id,
		},
		data: {
			read: true,
		},
		select: {
			id: true,
		},
	})

	typedTrigger(
		`private-user-${user.id}`,
		'notification:markAsRead',
		notificationId,
	)

	return notificationId
}

export async function markAllNotificationAsRead() {
	const user = await getRequiredUser()

	const updated = await prisma.notification.updateMany({
		where: {
			userId: user.id,
		},
		data: {
			read: true,
		},
	})

	if (updated.count > 0) {
		typedTrigger(`private-user-${user.id}`, 'notification:markAllAsRead', null)
	}
}

export async function deleteNotification(notificationId: string) {
	const user = await getRequiredUser()

	await prisma.notification.delete({
		where: {
			id: notificationId,
			userId: user.id,
		},
		select: { id: true },
	})

	typedTrigger(
		`private-user-${user.id}`,
		'notification:deleted',
		notificationId,
	)

	return notificationId
}

export async function deleteAllNotifications() {
	const user = await getRequiredUser()

	const deleted = await prisma.notification.deleteMany({
		where: {
			userId: user.id,
		},
	})

	if (deleted.count > 0) {
		typedTrigger(`private-user-${user.id}`, 'notification:deletedAll', null)
	}
}
