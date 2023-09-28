import { ProjectDisplay } from 'types'
import { cn } from '@/utils/misc'
import { TaskSkeleton } from '@/components/app/task/task-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function SectionSkeleton({
	index,
	display,
}: {
	index: number
	display: ProjectDisplay
}) {
	return (
		<>
			<div
				className={cn('hidden md:block', {
					'h-3 w-full': display === 'LIST',
					'h-full w-3': display === 'BOARD',
				})}
			/>
			<Skeleton
				className={cn(
					'flex w-full shrink-0 flex-col gap-4 overflow-hidden rounded-md px-2 py-6',
					display === 'BOARD' && 'max-h-full max-w-[288px]',
				)}
			>
				{/* Name */}
				<Skeleton className="ml-2 h-7 w-28" />
				<div className="flex flex-col">
					{new Array(Math.floor(Math.random() * 8)).fill(null).map((_, i) => (
						<TaskSkeleton key={`${index}-${i}`} />
					))}
				</div>
			</Skeleton>
		</>
	)
}
