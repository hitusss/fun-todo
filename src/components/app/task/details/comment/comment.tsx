import * as React from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, XIcon } from 'lucide-react'

import { ProjectRole, TaskComments } from 'types'
import { api } from '@/utils/trpc/api/client'
import { UserAvatar } from '@/components/app/user-avatar'
import { IconButton } from '@/components/ui/button'

import { TaskCommentForm } from './form'

export function TaskComment({
	comment,
	userId,
	role,
}: {
	comment: TaskComments[number]
	userId?: string
	role?: ProjectRole
}) {
	const [edit, setEdit] = React.useState(false)
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="rounded-md bg-secondary p-2 text-secondary-foreground"
		>
			<div className="flex justify-between">
				{edit ? (
					<TaskCommentForm
						defaultValues={{
							id: comment.id,
							taskId: comment.taskId,
							message: comment.message,
						}}
						onSubmit={async data => {
							await api.taskRouter.updateTaskComment.mutate(data)
							setEdit(false)
						}}
						className="flex-1"
					/>
				) : (
					<p className="text-lg">{comment.message}</p>
				)}
				<div className="shrink-0">
					{userId === comment.user.id ? (
						<IconButton
							variant="ghostPrimary"
							label={edit ? 'Cancel edit' : 'Edit comment'}
							onClick={() => setEdit(prev => !prev)}
						>
							{edit ? (
								<XIcon width={16} height={16} />
							) : (
								<PencilIcon width={16} height={16} />
							)}
						</IconButton>
					) : null}
					{userId === comment.user.id ||
					role === 'ADMIN' ||
					role === 'OWNER' ? (
						<IconButton
							variant="ghostPrimary"
							label="Delete comment"
							onClick={() =>
								api.taskRouter.deleteTaskComment.mutate(comment.id)
							}
						>
							<TrashIcon width={16} height={16} />
						</IconButton>
					) : null}
				</div>
			</div>
			<div className="mt-2 flex items-center justify-between">
				<div className="flex items-center gap-2 text-xs">
					<UserAvatar
						image={comment.user.image}
						name={comment.user.name || ''}
						size="sm"
					/>
					{comment.user.name}
				</div>
				<p className="text-xs text-muted-foreground">
					{format(new Date(comment.createdAt), 'PPpp')}
				</p>
			</div>
		</motion.div>
	)
}
