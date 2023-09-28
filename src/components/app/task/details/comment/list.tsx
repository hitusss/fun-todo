import * as React from 'react'
import { useSession } from 'next-auth/react'

import { TaskComments as TaskCommentsType } from 'types'
import { useUserProjects } from '@/stores/user-projects'
import { pusherClient, typedBind } from '@/utils/pusher'
import { api } from '@/utils/trpc/api/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'

import { TaskComment } from './comment'
import { TaskCommentForm } from './form'

export function TaskComments({
	taskId,
	projectId,
}: {
	taskId: string
	projectId: string
}) {
	const session = useSession({ required: true })
	const [loading, setLoading] = React.useState(false)
	const [comments, setComments] = React.useState<TaskCommentsType>([])
	const commentsRef = React.useRef<HTMLDivElement>(null)

	const role = useUserProjects
		.getState()
		.projects.find(project => project.id === projectId)?.members[0].role

	React.useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true)
			const res = await api.taskRouter.getTaskComments.query(taskId)
			setComments(res)
			setLoading(false)
		}
		fetchLogs()

		const channel = pusherClient.subscribe(`private-task-${taskId}`)

		typedBind(
			'taskComment:created',
			comment => {
				setComments(prev => [...prev, comment])
			},
			channel,
		)

		typedBind(
			'taskComment:updated',
			comment => {
				setComments(prev => prev.map(c => (c.id === comment.id ? comment : c)))
			},
			channel,
		)

		typedBind(
			'taskComment:deleted',
			commentId => {
				setComments(prev => prev.filter(comment => comment.id !== commentId))
			},
			channel,
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [taskId])

	React.useEffect(() => {
		if (!commentsRef.current) return
		commentsRef.current.scrollTo(0, commentsRef.current.scrollHeight)
	}, [comments.length])

	if (loading) {
		return (
			<div className="grid w-full flex-1 place-items-center">
				<Spinner />
			</div>
		)
	}
	return (
		<>
			<ScrollArea vertical ref={commentsRef} className="flex-1">
				<div className="h-full w-full space-y-1">
					{!!comments && comments.length > 0 ? (
						comments.map(comment => (
							<TaskComment
								key={comment.id}
								comment={comment}
								userId={session.data?.user?.id}
								role={role}
							/>
						))
					) : (
						<div className="grid h-full w-full place-items-center">
							<p className="text-muted-foreground">No comments</p>
						</div>
					)}
				</div>
			</ScrollArea>
			<TaskCommentForm
				defaultValues={{
					id: 'new',
					taskId,
					message: '',
				}}
				onSubmit={async data => {
					await api.taskRouter.createTaskComment.mutate(data)
				}}
			/>
		</>
	)
}
