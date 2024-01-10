'use client'

import { usePathname } from 'next/navigation'

import { ProjectDisplay } from 'types'
import { useUserProjects } from '@/stores/user-projects'
import { cn } from '@/utils/misc'
import { SectionSkeleton } from '@/components/app/section/section-skeleton'

export function DisplaySkeleton({
	minSections = 3,
	maxSections = 5,
}: {
	minSections?: number
	maxSections?: number
}) {
	const pathname = usePathname()
	const { projects } = useUserProjects()

	let display: ProjectDisplay = 'LIST'

	const inbox = pathname?.includes('inbox') ? projects.find(p => p.inbox) : null
	if (inbox) display = inbox.display

	const projectId = pathname?.includes('project') ? pathname.split('/')[3] : ''
	const project = projectId ? projects.find(p => p.id === projectId) : null
	if (project) display = project.display

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
