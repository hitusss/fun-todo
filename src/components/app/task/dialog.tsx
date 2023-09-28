'use client'

import { useTaskDialog } from '@/stores/task-dialog'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

import { TaskForm } from './form'

export function TaskDialog() {
	const { isOpen, details, onOpenChange, taskId } = useTaskDialog()
	return (
		<Dialog open={isOpen && !details} onOpenChange={onOpenChange}>
			<DialogContent className="w-screen max-w-lg">
				<DialogHeader>
					<DialogTitle>{taskId === 'new' ? 'Create' : 'Edit'} task</DialogTitle>
				</DialogHeader>
				<TaskForm />
			</DialogContent>
		</Dialog>
	)
}
