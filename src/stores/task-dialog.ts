import { create } from 'zustand'

import { UserProjects } from 'types'
import { api } from '@/utils/trpc/api/client'
import { TaskSchema } from '@/utils/validators/task'

import { useUserProjects } from './user-projects'

type State = {
	isOpen: boolean
	details: boolean
	taskId: string
	task: TaskSchema
	projectId: string | null | undefined
	sectionId: string | null | undefined
}

type Action = {
	open: ({
		details,
		taskId,
		projectId,
		sectionId,
		task,
	}: {
		details?: boolean
		taskId: string
		projectId?: string
		sectionId?: string
		task?: TaskSchema
	}) => void
	close: () => void
	onOpenChange: (isOpen: boolean) => void
}

const newTask = (projects: UserProjects): TaskSchema => ({
	id: 'new',
	title: '',
	description: '',
	isCompleted: false,
	projectAndSection: [projects[0]?.id, undefined],
	tags: [],
})

export const useTaskDialog = create<State & Action>(set => ({
	isOpen: false,
	details: false,
	taskId: '',
	task: newTask(useUserProjects.getState().projects),
	projectId: null,
	sectionId: null,
	open: async ({ details = false, taskId, projectId, sectionId, task }) => {
		if (taskId === 'new') {
			const projectDetailsToTasks = useUserProjects.getState().projects
			task = newTask(projectDetailsToTasks)
			if (projectId) {
				task.projectAndSection = [projectId, sectionId || undefined]
			}
			if (!projectId && sectionId) {
				projectId = projectDetailsToTasks.find(p =>
					p.sections.find(s => s.id === sectionId),
				)?.id
				if (projectId) {
					task.projectAndSection = [projectId, sectionId]
				}
			}
		} else {
			if (!task) {
				const res = await api.taskRouter.getTaskDetailsById.query(taskId)
				task = {
					...res,
					description: res.description || undefined,
					dueDate: res.dueDate ? new Date(res.dueDate) : undefined,
					projectAndSection: [res.projectId, res.sectionId || undefined],
				}
			}
		}
		set({ isOpen: true, details, taskId, task, projectId, sectionId })
	},
	close: () =>
		set({
			isOpen: false,
			taskId: '',
			task: newTask([]),
			projectId: null,
			sectionId: null,
		}),
	onOpenChange: isOpen => set({ isOpen }),
}))
