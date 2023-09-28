'use client'

import { format } from 'date-fns'
import { ClockIcon } from 'lucide-react'

import { useTaskDialog } from '@/stores/task-dialog'
import { Tag } from '@/components/app/tag/tag'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { TaskComments } from './comment/list'
import { TaskLogs } from './logs'

export function TaskDetails() {
	const {
		isOpen,
		details,
		onOpenChange,
		task: { id, title, description, dueDate, tags, projectAndSection },
	} = useTaskDialog()
	return (
		<Dialog open={isOpen && details} onOpenChange={onOpenChange}>
			<DialogContent className="h-[80vh] w-screen max-w-2xl grid-rows-[auto_auto_1fr]">
				<DialogHeader>
					<DialogTitle>Task details</DialogTitle>
				</DialogHeader>
				<div className="space-y-1 py-6">
					<p className="text-md font-semibold">{title}</p>
					{description ? (
						<p className="text-sm text-secondary-foreground/50">
							{description}
						</p>
					) : null}
					{dueDate ? (
						<p className="inline-flex items-center gap-1 text-sm text-secondary-foreground/50">
							<ClockIcon width={12} height={12} />
							{format(new Date(dueDate), 'PPP')}
						</p>
					) : null}
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
				</div>
				<Tabs
					defaultValue="comments"
					className="flex flex-col gap-2 overflow-hidden"
				>
					<TabsList>
						<TabsTrigger value="comments">Comments</TabsTrigger>
						<TabsTrigger value="logs">Logs</TabsTrigger>
					</TabsList>
					<TabsContent value="comments" asChild>
						<TaskComments taskId={id} projectId={projectAndSection[0]} />
					</TabsContent>
					<TabsContent value="logs" asChild>
						<TaskLogs taskId={id} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
