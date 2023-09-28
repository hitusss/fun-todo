import { z } from 'zod'

import {
	deleteAllNotifications,
	deleteNotification,
	markAllNotificationAsRead,
	markNotificationAsRead,
} from '@/models/notification'

import { protectedProcedure, router } from '../index'

export const notificationRouter = router({
	markNotificationAsRead: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const notificationId = await markNotificationAsRead(input)
			return notificationId
		}),
	markAllNotificationAsRead: protectedProcedure.mutation(async () => {
		await markAllNotificationAsRead()
		return undefined
	}),
	deleteNotification: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const notificationId = await deleteNotification(input)
			return notificationId
		}),
	deleteAllNotification: protectedProcedure.mutation(async () => {
		await deleteAllNotifications()
		return undefined
	}),
})
