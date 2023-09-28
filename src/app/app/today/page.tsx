import { getTodayTasks } from '@/models/task'
import { Section } from '@/components/app/section/section'

export default async function Today() {
	const today = await getTodayTasks()
	return (
		<div className="flex overflow-hidden">
			<Section
				editable={false}
				display="LIST"
				role="VIEWER"
				section={{
					id: '',
					name: 'Today',
					projectId: '',
					tasks: today,
				}}
				order={0}
			/>
		</div>
	)
}
