import { ProjectDisplay } from 'types'
import { cn } from '@/utils/misc'
import { SectionSkeleton } from '@/components/app/section/section-skeleton'

export function DisplaySkeleton({
	display,
	minSections = 3,
	maxSections = 5,
}: {
	display: ProjectDisplay
	minSections?: number
	maxSections?: number
}) {
	return (
		<div
			className={cn(
				'flex flex-1 items-start gap-3 md:gap-1',
				display === 'LIST' && 'flex-col',
			)}
		>
			{new Array(
				Math.floor(Math.random() * (maxSections - minSections) + minSections),
			)
				.fill(null)
				.map((_, i) => (
					<SectionSkeleton key={i} index={i} display={display} />
				))}
		</div>
	)
}
