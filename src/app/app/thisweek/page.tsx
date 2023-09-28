import { getThisWeekTasks } from '@/models/task'
import { Section } from '@/components/app/section/section'

export default async function ThisWeek() {
	const thisWeek = await getThisWeekTasks()
	return (
		<div className="flex overflow-hidden">
			<Section
				editable={false}
				display="LIST"
				role="VIEWER"
				section={{
					id: '',
					name: 'This Week',
					projectId: '',
					tasks: thisWeek,
				}}
				order={0}
			/>
		</div>
	)
}
