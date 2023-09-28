'use client'

import * as React from 'react'

import { UserNotifications, UserProjects } from 'types'
import { useUserNotifications } from '@/stores/user-notifications'
import { useUserProjects } from '@/stores/user-projects'
import { pusherClient, typedBind } from '@/utils/pusher'

function Providers({
	children,
	userId,
	projects,
	notifications,
}: {
	children: React.ReactNode
	userId: string
	projects: UserProjects
	notifications: UserNotifications
}) {
	React.useEffect(() => {
		useUserProjects.getState().setProjects(projects)
		useUserNotifications.getState().setNotifications(notifications)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	React.useEffect(() => {
		if (!userId) return
		const channel = pusherClient.subscribe(`private-user-${userId}`)

		typedBind(
			'project:created',
			project => {
				useUserProjects.getState().addProject(project)
			},
			channel,
		)

		typedBind(
			'project:updated',
			project => {
				useUserProjects.getState().updateProject(project)
			},
			channel,
		)

		typedBind(
			'project:deleted',
			projectId => {
				useUserProjects.getState().deleteProject(projectId)
			},
			channel,
		)

		typedBind(
			'projectSettings:updated',
			project => {
				useUserProjects.getState().updateProject(project)
			},
			channel,
		)

		typedBind(
			'tag:created',
			tag => {
				useUserProjects.getState().addTag(tag)
			},
			channel,
		)

		typedBind(
			'tag:updated',
			tag => {
				useUserProjects.getState().updateTag(tag)
			},
			channel,
		)

		typedBind(
			'tag:deleted',
			({ id, projectId }) => {
				useUserProjects.getState().deleteTag({ id, projectId })
			},
			channel,
		)

		typedBind(
			'notification:created',
			notification => {
				useUserNotifications.getState().addNotification(notification)
			},
			channel,
		)

		typedBind(
			'notification:markAsRead',
			notificationId => {
				useUserNotifications.getState().markNotificationAsRead(notificationId)
			},
			channel,
		)

		typedBind(
			'notification:markAllAsRead',
			() => {
				useUserNotifications.getState().markAllNotificationAsRead()
			},
			channel,
		)

		typedBind(
			'notification:deleted',
			notificationId => {
				useUserNotifications.getState().deleteNotification(notificationId)
			},
			channel,
		)

		typedBind(
			'notification:deletedAll',
			() => {
				useUserNotifications.getState().deleteAllNotifications()
			},
			channel,
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [userId])

	return <>{children}</>
}

export default Providers
