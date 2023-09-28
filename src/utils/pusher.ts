import chalk from 'chalk'
import PusherServer from 'pusher'
import PusherClient, { Channel } from 'pusher-js'

import {
	ProjectDetail,
	ProjectWithTasks,
	TaskComments,
	UserNotifications,
	UserProjects,
} from 'types'

export const pusherServer = new PusherServer({
	appId: process.env.PUSHER_APP_ID as string,
	key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
	secret: process.env.PUSHER_SECRET as string,
	cluster: 'eu',
	useTLS: true,
})

export function typedTrigger<T extends keyof Events>(
	channel: string | Array<string>,
	event: T,
	data: Events[T],
) {
	if (process.env.NODE_ENV === 'development')
		console.log(
			'\n',
			[
				chalk.bgYellow.black.bold('✅ Pusher typedTrigger'),
				`Trigger event: ${chalk.cyan(event)}`,
				`Event triggered on channel: ${chalk.cyan(channel)}`,
				`Event triggered with data:\n`,
			].join('\n'),
			data,
			'\n',
		)

	return pusherServer.trigger(channel, event, data)
}

export const pusherClient = new PusherClient(
	process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
	{
		channelAuthorization: {
			endpoint: '/api/pusher',
			transport: 'ajax',
		},
		cluster: 'eu',
	},
)

export function typedBind<T extends keyof Events>(
	event: T,
	callback: (data: Events[T]) => void,
	channel?: Channel,
) {
	if (process.env.NODE_ENV === 'development')
		console.log(
			[
				chalk.bgYellow.black.bold('📌 Pusher typedBind'),
				`Bind to event: ${chalk.cyan.bold(event)}`,
				`Event is bind on channel: ${chalk.cyan.bold(
					channel?.name || 'pusherClient',
				)}`,
			].join('\n'),
		)

	return (channel || pusherClient).bind(
		event,
		process.env.NODE_ENV === 'development'
			? (data: Events[T]) => {
					console.log(
						chalk.bgYellow.black.bold(`📩 ${event} triggered with data:`),
						data,
					)
					callback(data)
			  }
			: callback,
	)
}

type Events = {
	'task:created': ProjectWithTasks['tasks'][number]
	'task:updated': ProjectWithTasks['tasks'][number]
	'task:deleted': string
	'task:showCompleted': Pick<ProjectWithTasks, 'tasks' | 'sections'>
	'task:hideCompleted': null
	'taskComment:created': TaskComments[number]
	'taskComment:updated': TaskComments[number]
	'taskComment:deleted': string
	'section:created': ProjectWithTasks['sections'][number]
	'section:updated': Omit<ProjectWithTasks['sections'][number], 'tasks'>
	'section:deleted': string
	'tag:created': UserProjects[number]['tags'][number]
	'tag:updated': UserProjects[number]['tags'][number]
	'tag:deleted': {
		id: string
		projectId: string
	}
	'project:created': UserProjects[number]
	'project:updated': UserProjects[number]
	'project:deleted': string
	'projectSettings:updated': Pick<
		UserProjects[number],
		'id' | 'display' | 'showCompleted' | 'taskOrder'
	>
	'projectMember:created': ProjectDetail['members'][number]
	'projectMember:deleted': string
	'projectInvite:created': ProjectDetail['invites'][number]
	'projectInvite:deleted': string
	reorder:
		| {
				senderId: string
				type: 'section'
				id: string
				order: number
		  }
		| {
				senderId: string
				type: 'task'
				id: string
				sourceSectionId: string
				destinationSectionId: string
				order: number
		  }
	'notification:created': UserNotifications[number]
	'notification:markAsRead': string
	'notification:markAllAsRead': null
	'notification:deleted': string
	'notification:deletedAll': null
}
