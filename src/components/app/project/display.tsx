'use client'

import * as React from 'react'
import {
	closestCenter,
	CollisionDetection,
	DndContext,
	DragOverlay,
	getFirstCollision,
	KeyboardSensor,
	MeasuringStrategy,
	MouseSensor,
	pointerWithin,
	rectIntersection,
	TouchSensor,
	UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useIsPresent } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { createPortal } from 'react-dom'

import { ProjectWithTasks } from 'types'
import { useSectionDialog } from '@/stores/section-dialog'
import { useTaskDialog } from '@/stores/task-dialog'
import { useUserProjects } from '@/stores/user-projects'
import { cn } from '@/utils/misc'
import { pusherClient, typedBind } from '@/utils/pusher'
import { sortTasks } from '@/utils/tasks'
import { api } from '@/utils/trpc/api/client'
import { Section } from '@/components/app/section/section'
import { Task } from '@/components/app/task/task'
import { Button, IconButton } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ProjectDisplay({
	id,
	tasks,
	sections,
}: Omit<ProjectWithTasks, 'name' | 'showCompleted'>) {
	const session = useSession({ required: true })
	const isPresent = useIsPresent()
	const [localSections, setLocalSections] = React.useState<typeof sections>(
		() => [
			{
				id: '',
				name: 'Default',
				projectId: id,
				order: 0,
				tasks,
				createdAt: new Date(),
			},
			...sections,
		],
	)
	const [clonedSection, setClonedSection] = React.useState<
		typeof sections | undefined
	>(undefined)
	const [body, setBody] = React.useState<HTMLElement | undefined>()
	const [activeId, setActiveId] = React.useState<UniqueIdentifier | undefined>(
		undefined,
	)
	const lastOverId = React.useRef<UniqueIdentifier | undefined>(undefined)
	const recentlyMovedToNewContainer = React.useRef(false)
	const {
		display = 'LIST',
		taskOrder = 'CUSTOM',
		showCompleted = false,
		role = 'VIEWER',
	} = useUserProjects(state => {
		const p = state.projects.find(p => p.id === id)
		return {
			display: p?.display,
			taskOrder: p?.taskOrder,
			showCompleted: p?.showCompleted,
			role: p?.members[0].role,
		}
	})
	const { open: openSectionDialog } = useSectionDialog()
	const { open: openTaskDialog } = useTaskDialog()

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const collisionDetectionStrategy: CollisionDetection = React.useCallback(
		args => {
			if (activeId && localSections.findIndex(s => s.id === activeId) !== -1) {
				return closestCenter({
					...args,
					droppableContainers: args.droppableContainers.filter(
						container =>
							localSections.findIndex(s => s.id === container.id) !== -1,
					),
				})
			}

			const pointerIntersections = pointerWithin(args)
			const intersections =
				pointerIntersections.length > 0
					? pointerIntersections
					: rectIntersection(args)
			let overId = getFirstCollision(intersections, 'id')

			if (overId != null) {
				if (localSections.findIndex(s => s.id === overId) !== -1) {
					const tasks = localSections.find(s => s.id === overId)?.tasks

					if (tasks && tasks.length > 0) {
						overId = closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(
								container =>
									container.id !== overId &&
									tasks.findIndex(t => t.id === container.id) !== -1,
							),
						})[0]?.id
					}
				}

				lastOverId.current = overId

				return [{ id: overId }]
			}

			if (recentlyMovedToNewContainer.current) {
				lastOverId.current = activeId
			}

			return lastOverId.current ? [{ id: lastOverId.current }] : []
		},
		[activeId, localSections],
	)

	React.useEffect(() => {
		setBody(document.body)
	}, [])

	React.useEffect(() => {
		if (!isPresent || !id || !session.data?.user.id) return
		const channel = pusherClient.subscribe(`private-project-${id}`)

		/* 
			Section
		*/
		typedBind(
			'section:created',
			section => {
				setLocalSections(prev => {
					prev.splice(section.order + 1, 0, section)
					return [...prev]
				})
			},
			channel,
		)
		typedBind(
			'section:updated',
			section => {
				setLocalSections(prev =>
					prev.map(s => (s.id === section.id ? { ...s, ...section } : s)),
				)
			},
			channel,
		)
		typedBind(
			'section:deleted',
			(sectionId: string) => {
				setLocalSections(prev => prev.filter(s => s.id !== sectionId))
			},
			channel,
		)

		/* 
			Task
		*/
		typedBind(
			'task:created',
			task => {
				if (!task.sectionId) task.sectionId = ''
				setLocalSections(prev =>
					prev.map(s =>
						s.id === task.sectionId
							? {
									...s,
									tasks: sortTasks({
										tasks: [...s.tasks, {
											...task,
											dueDate: task.dueDate ? new Date(task.dueDate) : null
										}],
										taskOrder,
									}),
							  }
							: s,
					),
				)
			},
			channel,
		)
		typedBind(
			'task:updated',
			task => {
				if (!task.sectionId) task.sectionId = ''
				setLocalSections(prev =>
					prev.map(s =>
						s.id === task.sectionId
							? {
									...s,
									tasks: sortTasks({
										tasks: s.tasks
											.map(t => (t.id === task.id ? {
												...task,
												dueDate: task.dueDate ? new Date(task.dueDate) : null
											} : t))
											.filter(t => (showCompleted ? true : !t.isCompleted)),
										taskOrder,
									}),
							  }
							: s,
					),
				)
			},
			channel,
		)
		typedBind(
			'task:deleted',
			taskId => {
				setLocalSections(prev =>
					prev.map(s => {
						s.tasks = s.tasks.filter(t => t.id !== taskId)
						return s
					}),
				)
			},
			channel,
		)

		typedBind('task:showCompleted', project => {
			setLocalSections(prev =>
				prev.map(prevSection => {
					if (prevSection.id === '') {
						return {
							...prevSection,
							tasks: [...prevSection.tasks, ...project.tasks],
						}
					} else {
						return {
							...prevSection,
							tasks: [
								...prevSection.tasks,
								...(project.sections.find(s => s.id === prevSection.id)
									?.tasks || []),
							],
						}
					}
				}),
			)
		})

		typedBind('task:hideCompleted', () => {
			setLocalSections(prev =>
				prev.map(prevSection => ({
					...prevSection,
					tasks: prevSection.tasks.filter(task => !task.isCompleted),
				})),
			)
		})

		/* 
			Reorder
		*/
		typedBind(
			'reorder',
			data => {
				if (data.senderId === session.data?.user.id) return
				switch (data.type) {
					case 'section': {
						setLocalSections(prevSections => {
							const sectionIndex = prevSections.findIndex(s => s.id === data.id)

							return arrayMove(prevSections, sectionIndex, data.order)
						})
						break
					}
					case 'task': {
						setLocalSections(prevSections => {
							const newSections = [...prevSections]
							if (data.sourceSectionId === data.destinationSectionId) {
								const sectionIndex = newSections.findIndex(
									s => s.id === data.sourceSectionId,
								)
								const taskIndex = newSections[sectionIndex].tasks.findIndex(
									t => t.id === data.id,
								)
								const [removed] = newSections[sectionIndex].tasks.splice(
									taskIndex,
									1,
								)
								newSections[sectionIndex].tasks.splice(data.order, 0, removed)
							} else {
								const sourceSectionIndex = newSections.findIndex(
									s => s.id === data.sourceSectionId,
								)
								const destinationSectionIndex = newSections.findIndex(
									s => s.id === data.destinationSectionId,
								)
								const taskIndex = newSections[
									sourceSectionIndex
								].tasks.findIndex(t => t.id === data.id)
								const [removed] = newSections[sourceSectionIndex].tasks.splice(
									taskIndex,
									1,
								)
								newSections[destinationSectionIndex].tasks.splice(
									data.order,
									0,
									removed,
								)
							}
							return newSections
						})
						break
					}
					default:
						break
				}
			},
			channel,
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [id, isPresent, session.data?.user.id, showCompleted, taskOrder])

	React.useEffect(() => {
		setLocalSections(prev =>
			prev.map(prevSection => ({
				...prevSection,
				tasks: sortTasks({
					tasks: prevSection.tasks,
					taskOrder,
				}),
			})),
		)
	}, [taskOrder])

	React.useEffect(() => {
		requestAnimationFrame(() => {
			recentlyMovedToNewContainer.current = false
		})
	}, [localSections])

	return (
		<>
			{role !== 'VIEWER' ? (
				<IconButton
					variant="default"
					label="Create new task"
					className="absolute bottom-4 right-4 z-50 rounded-full"
					onClick={() => openTaskDialog({ taskId: 'new', projectId: id })}
				>
					<PlusIcon />
				</IconButton>
			) : null}
			<DndContext
				sensors={sensors}
				collisionDetection={collisionDetectionStrategy}
				measuring={{
					droppable: {
						strategy: MeasuringStrategy.Always,
					},
				}}
				onDragStart={({ active }) => {
					setClonedSection([...localSections])
					setActiveId(active.id)
				}}
				onDragOver={({ active, over }) => {
					if (active.data.current?.type === 'section' || !over) return

					const activeSectionIndex = localSections.findIndex(
						s => s.tasks.findIndex(t => t.id === active.id) !== -1,
					)
					const overSectionIndex = localSections.findIndex(s =>
						over.data.current?.type === 'section'
							? s.id === over.id
							: s.tasks.findIndex(t => t.id === over.id) !== -1,
					)

					if (activeSectionIndex === -1 || overSectionIndex === -1) {
						return
					}

					if (activeSectionIndex !== overSectionIndex) {
						setLocalSections(prevSections => {
							const activeTasks = prevSections[activeSectionIndex].tasks
							const overTasks = prevSections[overSectionIndex].tasks
							const activeIndex = activeTasks.findIndex(t => t.id === active.id)
							const overIndex = overTasks.findIndex(t => t.id === over.id)

							let newIndex: number

							if (over.data.current?.type === 'section') {
								newIndex = overTasks.length + 1
							} else {
								const isBelowOverItem =
									over &&
									active.rect.current.translated &&
									active.rect.current.translated.top >
										over.rect.top + over.rect.height

								const modifier = isBelowOverItem ? 1 : 0

								newIndex =
									overIndex >= 0 ? overIndex + modifier : overTasks.length + 1
							}

							const newSections = [...prevSections]
							const [removed] = newSections[activeSectionIndex].tasks.splice(
								activeIndex,
								1,
							)
							newSections[overSectionIndex].tasks.splice(newIndex, 0, removed)

							recentlyMovedToNewContainer.current = true
							return newSections
						})
					}
				}}
				onDragEnd={({ active, over }) => {
					if (!over) return
					if (active.data.current?.type === 'section' && over.id) {
						setLocalSections(prevSections => {
							const activeIndex = prevSections.findIndex(
								s => s.id === active.id,
							)
							const overIndex = prevSections.findIndex(s => s.id === over.id)

							api.reorderRouter.reorder.mutate({
								projectId: id,
								type: 'section',
								id: prevSections[activeIndex].id,
								order: overIndex,
							})

							return arrayMove(prevSections, activeIndex, overIndex)
						})
					} else {
						const activeSectionIndex = localSections.findIndex(
							s => s.tasks.findIndex(t => t.id === active.id) !== -1,
						)
						const overSectionIndex = localSections.findIndex(s =>
							over.data.current?.type === 'section'
								? s.id === over.id
								: s.tasks.findIndex(t => t.id === over.id) !== -1,
						)

						if (activeSectionIndex === -1 || overSectionIndex === -1) {
							return
						}

						if (activeSectionIndex === overSectionIndex) {
							setLocalSections(prevSections => {
								const tasks = prevSections[activeSectionIndex].tasks
								const activeIndex = tasks.findIndex(t => t.id === active.id)
								const overIndex = tasks.findIndex(t => t.id === over.id)

								let newIndex: number

								if (over.data.current?.type === 'section') {
									newIndex = tasks.length + 1
								} else {
									const isBelowOverItem =
										over &&
										active.rect.current.translated &&
										active.rect.current.translated.top >
											over.rect.top + over.rect.height

									const modifier = isBelowOverItem ? 1 : 0

									newIndex =
										overIndex >= 0 ? overIndex + modifier : tasks.length + 1
								}

								api.reorderRouter.reorder.mutate({
									projectId: id,
									type: 'task',
									id: tasks[activeIndex].id,
									sectionId: clonedSection!.find(s =>
										over.data.current?.type === 'section'
											? s.id === over.id
											: s.tasks.findIndex(t => t.id === over.id) !== -1,
									)!.id,
									order: newIndex,
								})

								const newSections = [...prevSections]
								const [removed] = newSections[overSectionIndex].tasks.splice(
									activeIndex,
									1,
								)
								newSections[overSectionIndex].tasks.splice(newIndex, 0, removed)

								return newSections
							})
						} else {
							setLocalSections(prevSections => {
								const activeTasks = prevSections[activeSectionIndex].tasks
								const overTasks = prevSections[overSectionIndex].tasks
								const activeIndex = activeTasks.findIndex(
									t => t.id === active.id,
								)
								const overIndex = overTasks.findIndex(t => t.id === over.id)

								let newIndex: number

								if (over.data.current?.type === 'section') {
									newIndex = overTasks.length + 1
								} else {
									const isBelowOverItem =
										over &&
										active.rect.current.translated &&
										active.rect.current.translated.top >
											over.rect.top + over.rect.height

									const modifier = isBelowOverItem ? 1 : 0

									newIndex =
										overIndex >= 0 ? overIndex + modifier : overTasks.length + 1
								}

								api.reorderRouter.reorder.mutate({
									projectId: id,
									type: 'task',
									id: tasks[activeIndex].id,
									sectionId: clonedSection!.find(s =>
										over.data.current?.type === 'section'
											? s.id === over.id
											: s.tasks.findIndex(t => t.id === over.id) !== -1,
									)!.id,
									order: newIndex,
								})

								const newSections = [...prevSections]
								const [removed] = newSections[activeSectionIndex].tasks.splice(
									activeIndex,
									1,
								)
								newSections[overSectionIndex].tasks.splice(newIndex, 0, removed)
								return newSections
							})
						}
					}

					setActiveId(undefined)
					setClonedSection(undefined)
				}}
				onDragCancel={() => {
					if (clonedSection) {
						setLocalSections(clonedSection)
					}

					setActiveId(undefined)
					setClonedSection(undefined)
				}}
			>
				<ScrollArea
					className="h-full"
					vertical={display === 'LIST'}
					horizontal={display === 'BOARD'}
				>
					<div
						className={cn(
							'flex flex-1 items-start gap-3 md:gap-1',
							display === 'LIST' && 'flex-col',
						)}
					>
						<SortableContext
							strategy={
								display === 'LIST'
									? verticalListSortingStrategy
									: horizontalListSortingStrategy
							}
							items={localSections.map(s => s.id)}
						>
							{localSections.map((section, sectionIndex) => (
								<Section
									key={section.id}
									display={display}
									role={role}
									section={section}
									order={sectionIndex}
									draggable={section.id !== 'default'}
									taskDraggable={taskOrder === 'CUSTOM'}
								/>
							))}
						</SortableContext>

						<Button
							size="lg"
							variant="outline"
							onClick={() =>
								openSectionDialog({
									projectId: id,
									sectionId: 'new',
									order: localSections.length,
								})
							}
							className={cn('w-full shrink-0 font-semibold', {
								'md:mt-2': display === 'LIST',
								'max-w-[288px] md:ml-2': display === 'BOARD',
							})}
						>
							<PlusIcon width={16} height={16} /> Add section
						</Button>
					</div>
				</ScrollArea>
				{body
					? createPortal(
							<DragOverlay>
								{activeId ? (
									localSections.findIndex(s => s.id === activeId) === -1 ? (
										<Task
											task={
												localSections
													.find(
														s =>
															s.tasks.findIndex(t => t.id === activeId) !== -1,
													)!
													.tasks.find(t => t.id === activeId)!
											}
										/>
									) : (
										<Section
											display={display}
											role={role}
											section={localSections.find(s => s.id === activeId)!}
											order={0}
										/>
									)
								) : null}
							</DragOverlay>,
							body,
					  )
					: null}
			</DndContext>
		</>
	)
}
