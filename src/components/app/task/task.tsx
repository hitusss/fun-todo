'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Checkbox from '@radix-ui/react-checkbox'
import { format } from 'date-fns'
import {
	CheckIcon,
	ClockIcon,
	EditIcon,
	GripVerticalIcon,
	MessageSquareIcon,
	TrashIcon,
} from 'lucide-react'

import { ProjectWithTasks } from 'types'
import { useConfirmDialog } from '@/stores/confirm-dialog'
import { useTaskDialog } from '@/stores/task-dialog'
import { cn } from '@/utils/misc'
import { pusherClient, typedBind } from '@/utils/pusher'
import { api } from '@/utils/trpc/api/client'
import { Tag } from '@/components/app/tag/tag'
import { IconButton } from '@/components/ui/button'

export function Task({
	task: {
		id,
		title,
		description,
		dueDate,
		isCompleted,
		projectId,
		sectionId,
		tags,
		taskComment,
	},
	draggable = true,
}: {
	task: ProjectWithTasks['tasks'][number]
	draggable?: boolean
}) {
	const [localComments, setLocalComments] = React.useState(taskComment)
	const {
		setNodeRef,
		attributes,
		listeners,
		isDragging,
		transform,
		transition,
	} = useSortable({
		disabled: !draggable,
		id,
	})
	const { open } = useTaskDialog()
	const { open: openConfirmDialog } = useConfirmDialog()

	const draggableProps = draggable ? { ...attributes, ...listeners } : undefined

	React.useEffect(() => {
		const channel = pusherClient.subscribe(`private-task-${id}`)

		typedBind(
			'taskComment:created',
			comment => {
				setLocalComments(prev => [...prev, { id: comment.id }])
			},
			channel,
		)
		typedBind(
			'taskComment:deleted',
			commentId => {
				setLocalComments(prev =>
					prev.filter(comment => comment.id !== commentId),
				)
			},
			channel,
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [id])

	return (
		<li
			ref={draggable ? setNodeRef : undefined}
			style={{
				transition,
				transform: CSS.Translate.toString(transform),
				opacity: isDragging ? 0.5 : undefined,
			}}
			className={cn(
				'group/task mb-1 flex select-none items-center gap-2 rounded-md border bg-secondary p-4 text-secondary-foreground @container',
				{
					'opacity-50': isCompleted,
				},
			)}
		>
			<span
				className="p-1 @md:group-hover/task:opacity-100 @md:isHover:opacity-0"
				{...draggableProps}
			>
				<GripVerticalIcon />
			</span>

			<div className="flex flex-1 flex-col @md:flex-row">
				<div className="inline-flex flex-1 gap-2">
					<Checkbox.Root
						onClick={() => {
							api.taskRouter.toggleCompleteTask.mutate(id)
						}}
						defaultChecked={isCompleted}
						className="group/checkbox mt-1.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 hover:opacity-75"
					>
						<Checkbox.Indicator
							forceMount
							className="absolute opacity-0 group-hover/checkbox:opacity-25 radix-state-checked:opacity-100"
						>
							<CheckIcon width={20} height={20} />
						</Checkbox.Indicator>
					</Checkbox.Root>
					<button
						className="flex-1 text-start"
						onClick={() =>
							open({
								details: true,
								taskId: id,
								task: {
									id,
									title,
									description: description ?? undefined,
									dueDate: dueDate ?? undefined,
									isCompleted,
									projectAndSection: [projectId, sectionId ?? undefined],
									tags,
								},
							})
						}
					>
						<p
							className={cn('font-medium', {
								'line-through': isCompleted,
							})}
						>
							{title}
						</p>
						{description ? (
							<p className="text-sm text-secondary-foreground/50">
								{description}
							</p>
						) : null}
						<div className="flex flex-wrap gap-2">
							{dueDate ? (
								<p className="inline-flex items-center gap-1 text-sm text-secondary-foreground/50">
									<ClockIcon width={12} height={12} />
									{format(new Date(dueDate), 'PPP')}
								</p>
							) : null}
							{localComments.length > 0 ? (
								<p className="inline-flex items-center gap-1 text-sm text-secondary-foreground/50">
									<MessageSquareIcon width={12} height={12} />
									{localComments.length}
								</p>
							) : null}
						</div>
						{tags.length > 0 ? (
							<div className="flex flex-wrap gap-1">
								{tags.map(tag => (
									<Tag
										key={tag.id}
										name={tag.name}
										bgColor={tag.bgColor}
										textColor={tag.textColor}
									/>
								))}
							</div>
						) : null}
					</button>
				</div>
				<div className="flex items-center justify-end gap-2 @md:group-hover/task:opacity-100 @md:isHover:opacity-0">
					<IconButton
						variant="ghostPrimary"
						label="Delete task"
						onClick={() =>
							openConfirmDialog({
								title: 'Are you sure you want to delete this task?',
								confirmHandler: async () =>
									await api.taskRouter.deleteTask.mutate(id),
							})
						}
					>
						<TrashIcon width={16} height={16} />
					</IconButton>
					<IconButton
						variant="ghostPrimary"
						onClick={() =>
							open({
								taskId: id,
								task: {
									id,
									title,
									description: description ?? undefined,
									dueDate: dueDate ?? undefined,
									isCompleted,
									projectAndSection: [projectId, sectionId ?? undefined],
									tags,
								},
							})
						}
						label="Edit task"
					>
						<EditIcon width={16} height={16} />
					</IconButton>
				</div>
			</div>
		</li>
	)
}
