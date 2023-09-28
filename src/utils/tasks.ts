import type { ProjectWithTasks, TaskOrder } from 'types'

export function sortTasks({
	tasks,
	taskOrder,
}: {
	tasks: ProjectWithTasks['tasks']
	taskOrder: TaskOrder
}) {
	return tasks.sort((a, b) => {
		if (a.isCompleted !== b.isCompleted) {
			return a.isCompleted ? 1 : -1
		}

		switch (taskOrder) {
			case 'CUSTOM': {
				if (a.order === null) {
					return 1
				} else if (b.order === null) {
					return -1
				}

				if (a.order !== b.order) {
					return a.order - b.order
				}
			}
			case 'DUEDATE': {
				if (a.dueDate && b.dueDate && +a.dueDate !== +b.dueDate) {
					return +a.dueDate - +b.dueDate
				} else if (a.dueDate && !b.dueDate) {
					return -1
				} else if (!a.dueDate && b.dueDate) {
					return 1
				}
			}
			default:
				break
		}

		return +a.createdAt - +b.createdAt
	})
}
