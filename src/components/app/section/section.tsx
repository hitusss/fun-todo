'use client'

import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EditIcon, PlusIcon } from 'lucide-react'

import { ProjectDisplay, ProjectRole, ProjectWithTasks } from 'types'
import { useSectionDialog } from '@/stores/section-dialog'
import { useTaskDialog } from '@/stores/task-dialog'
import { cn } from '@/utils/misc'
import { Task } from '@/components/app/task/task'
import { Button, IconButton } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Section({
	display,
	role,
	section: { id, name, projectId, tasks },
	order,
	draggable = true,
	editable = true,
	taskDraggable = true,
}: {
	display: ProjectDisplay
	role: ProjectRole
	section: Omit<ProjectWithTasks['sections'][number], 'order' | 'createdAt'>
	order: number
	draggable?: boolean
	editable?: boolean
	taskDraggable?: boolean
}) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transition,
		transform,
	} = useSortable({
		disabled: !draggable,
		id,
		data: {
			type: 'section',
		},
	})
	const { open: openSectionDialog } = useSectionDialog()
	const { open: openTaskDialog } = useTaskDialog()

	const draggableProps = draggable ? { ...attributes, ...listeners } : undefined

	if (id === '' && tasks.length === 0) {
		return null
	}

	return (
		<>
			{id !== '' || role !== 'VIEWER' ? (
				<button
					className={cn(
						'hidden items-center justify-center gap-2 whitespace-nowrap text-primary opacity-0 transition-all duration-300 hover:opacity-100 md:flex',
						'before:bg-primary before:content-[""] after:bg-primary after:content-[""]',
						{
							'h-3 w-full before:h-px before:w-full after:h-px after:w-full':
								display === 'LIST',
							'h-full max-h-full w-3 before:h-full before:w-px after:h-full after:w-px':
								display === 'BOARD',
						},
					)}
					style={
						display === 'BOARD'
							? {
									writingMode: 'vertical-rl',
									textOrientation: 'mixed',
							  }
							: undefined
					}
					onClick={() =>
						openSectionDialog({
							projectId,
							sectionId: 'new',
							order: order - 1,
						})
					}
				>
					Create Section
				</button>
			) : null}

			<section
				ref={draggable ? setNodeRef : undefined}
				style={{
					transition,
					transform: CSS.Translate.toString(transform),
					opacity: isDragging ? 0.5 : undefined,
				}}
				className={cn(
					'flex w-full shrink-0 flex-col gap-4 overflow-hidden rounded-md bg-background px-2 py-6 text-foreground shadow-md',
					display === 'BOARD' && 'max-h-full max-w-[288px]',
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex-1 select-none" {...draggableProps}>
						<h4 className="ml-2">{name}</h4>
					</div>
					{editable ? (
						<IconButton
							onClick={() =>
								openSectionDialog({
									sectionId: id,
									projectId,
									order,
									section: {
										id,
										name,
										projectId,
										order,
									},
								})
							}
							label="Edit section"
						>
							<EditIcon width={16} height={16} />
						</IconButton>
					) : null}
				</div>

				<SortableContext
					strategy={verticalListSortingStrategy}
					items={tasks.map(task => task.id)}
				>
					<ScrollArea className="!min-h-[4rem] rounded-md" vertical>
						<ul className="w-full">
							{tasks.map(task => (
								<Task
									key={task.id}
									task={task}
									draggable={taskDraggable && !task.isCompleted}
								/>
							))}
						</ul>
					</ScrollArea>
				</SortableContext>

				{role !== 'VIEWER' ? (
					<Button
						size="sm"
						variant="ghost"
						onClick={() =>
							openTaskDialog({
								taskId: 'new',
								projectId,
								sectionId: id === 'default' ? undefined : id,
							})
						}
						className="shrink-0 font-semibold"
					>
						<PlusIcon width={16} height={16} /> Add task
					</Button>
				) : null}
			</section>
		</>
	)
}
