import * as React from 'react'
import { format } from 'date-fns'

import { TaskLogs as TaskLogsType } from 'types'
import { api } from '@/utils/trpc/api/client'
import { UserAvatar } from '@/components/app/user-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'

export function TaskLogs({ taskId }: { taskId: string }) {
	const [loading, setLoading] = React.useState(false)
	const [logs, setLogs] = React.useState<TaskLogsType>()

	React.useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true)
			const res = await api.logsRouter.getTaskLogs.query(taskId)
			setLogs(res)
			setLoading(false)
		}
		fetchLogs()
	}, [taskId])

	if (loading) {
		return (
			<div className="grid w-full flex-1 place-items-center">
				<Spinner />
			</div>
		)
	}
	return (
		<ScrollArea vertical className="flex-1">
			<div className="h-full w-full space-y-1 ">
				{!!logs && logs.length > 0 ? (
					logs.map(log => (
						<div
							key={log.id}
							className="rounded-md bg-secondary p-2 text-secondary-foreground"
						>
							<p className="text-md font-semibold">{log.title}</p>
							<p className="text-xs text-muted-foreground">{log.description}</p>
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<div className="flex items-center gap-2 text-xs">
									<UserAvatar
										image={log.user.image}
										name={log.user.name || ''}
										size="sm"
									/>
									{log.user.name}
								</div>
								<p>{format(new Date(log.createdAt), 'PPpp')}</p>
							</div>
						</div>
					))
				) : (
					<div className="grid h-full w-full place-items-center">
						<p className="text-muted-foreground">No logs</p>
					</div>
				)}
			</div>
		</ScrollArea>
	)
}
