import { create } from 'zustand'

import { UserNotifications } from 'types'

type State = {
	notifications: UserNotifications
	notificationCount: number
}

type Action = {
	setNotifications: (notifications: UserNotifications) => void
	addNotification: (notification: UserNotifications[number]) => void
	markNotificationAsRead: (notificationId: string) => void
	markAllNotificationAsRead: () => void
	deleteNotification: (notificationId: string) => void
	deleteAllNotifications: () => void
}

export const useUserNotifications = create<State & Action>(set => ({
	notifications: [],
	notificationCount: 0,
	setNotifications: notifications => {
		set({
			notifications,
			notificationCount: notifications.reduce(
				(acc, n) => (n.read ? acc : acc + 1),
				0,
			),
		})
	},
	addNotification: notification => {
		set(prev => ({
			notifications: [...prev.notifications, notification],
			notificationCount: prev.notificationCount + 1,
		}))
	},
	markNotificationAsRead: notificationId => {
		set(prev => ({
			notifications: prev.notifications.map(n =>
				n.id === notificationId ? { ...n, read: true } : n,
			),
			notificationCount: prev.notificationCount - 1,
		}))
	},
	markAllNotificationAsRead: () => {
		set(prev => ({
			notifications: prev.notifications.map(n => ({ ...n, read: true })),
			notificationCount: 0,
		}))
	},
	deleteNotification: notificationId => {
		set(prev => ({
			notifications: prev.notifications.filter(n => n.id !== notificationId),
			notificationCount: prev.notificationCount - 1,
		}))
	},
	deleteAllNotifications: () => {
		set({ notifications: [], notificationCount: 0 })
	},
}))
