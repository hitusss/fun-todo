import * as React from 'react'
import { ColumnsIcon, RowsIcon } from 'lucide-react'

import { ProjectDisplay, TaskOrder, UserProjects } from 'types'
import { api } from '@/utils/trpc/api/client'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

type ProjectSettingsPopover = {
	children: React.ReactNode
	projectId: string
	display: UserProjects[number]['display']
	showCompleted: UserProjects[number]['showCompleted']
	taskOrder: UserProjects[number]['taskOrder']
}

export function ProjectSettingsPopover({
	children,
	projectId,
	display,
	showCompleted,
	taskOrder,
}: ProjectSettingsPopover) {
	const [loading, setLoading] = React.useState(false)

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-auto px-6 py-4" align="end">
				<div className="flex items-center justify-between">
					<h4>Project Settings</h4>
					{loading ? <Spinner className="h-5 w-5" /> : null}
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-5">
						<p>Layout</p>
						<Select
							value={display}
							onValueChange={async (value: ProjectDisplay) => {
								if (!value) return
								setLoading(true)
								await api.projectRouter.updateProjectSettings.mutate({
									id: projectId,
									data: { display: value },
								})
								setLoading(false)
							}}
							disabled={loading}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder="Select a display mode"
									className="flex-1"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Display mode</SelectLabel>
									<SelectItem value="LIST">
										<div className="inline-flex items-center justify-center gap-2">
											<RowsIcon /> List
										</div>
									</SelectItem>
									<SelectItem value="BOARD">
										<div className="inline-flex items-center justify-center gap-2">
											<ColumnsIcon /> Board
										</div>
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-5">
						<p>Sorting</p>
						<Select
							value={taskOrder}
							onValueChange={async (value: TaskOrder) => {
								if (!value) return
								setLoading(true)
								await api.projectRouter.updateProjectSettings.mutate({
									id: projectId,
									data: { taskOrder: value },
								})
								setLoading(false)
							}}
							disabled={loading}
						>
							<SelectTrigger>
								<SelectValue
									placeholder="Select a task order"
									className="flex-1"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Task order</SelectLabel>
									<SelectItem value="CUSTOM">Custom</SelectItem>
									<SelectItem value="DUEDATE">Due Date</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-5">
						<p>Show completed</p>
						<Switch
							id="showCompleted"
							defaultChecked={showCompleted}
							onCheckedChange={async checked => {
								setLoading(true)
								await api.projectRouter.updateProjectSettings.mutate({
									id: projectId,
									data: { showCompleted: checked },
								})
								setLoading(false)
							}}
							disabled={loading}
							className="justify-self-end"
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}
