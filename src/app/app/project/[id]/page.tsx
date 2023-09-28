import { getProjectTasks } from '@/models/task'
import { ProjectDisplay } from '@/components/app/project/display'

export default async function Project({ params }: { params: { id: string } }) {
	const project = await getProjectTasks(params.id)
	return (
		<ProjectDisplay
			id={project.id}
			tasks={project.tasks}
			sections={project.sections}
		/>
	)
}
