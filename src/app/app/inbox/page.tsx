import { getInboxTasks } from '@/models/task'
import { ProjectDisplay } from '@/components/app/project/display'

export default async function Inbox() {
	const inbox = await getInboxTasks()
	return (
		<ProjectDisplay
			id={inbox.id}
			tasks={inbox.tasks}
			sections={inbox.sections}
		/>
	)
}
