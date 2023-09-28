import { GripVerticalIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export function TaskSkeleton() {
	return (
		<Skeleton className="group/task mb-1 flex select-none items-center gap-2 rounded-md p-4 @container">
			<span className="animate-pulse p-1 text-primary/10 @md:group-hover/task:opacity-100 @md:isHover:opacity-0">
				<GripVerticalIcon />
			</span>
			<div className="inline-flex flex-1 gap-2">
				{/* Checkbox */}
				<Skeleton className="mt-1.5 h-6 w-6 shrink-0 rounded-full" />
				<div className="flex-1 space-y-1 text-start">
					{/* Title */}
					<Skeleton className="h-7 w-28" />
					{/* Description */}
					<Skeleton className="h-5 w-3/4" />
					<div className="flex flex-wrap gap-2">
						{/* DueDate */}
						<Skeleton className="h-5 w-28" />
						{/* Comments count */}
						<Skeleton className="h-5 w-8" />
					</div>
				</div>
			</div>
		</Skeleton>
	)
}
