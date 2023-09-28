'use client'

import { useUserProjects } from '@/stores/user-projects'
import { DisplaySkeleton } from '@/components/app/project/display-skeleton'

export default function Loading() {
	const { projects } = useUserProjects()

	const project = projects.find(p => p.inbox)

	return <DisplaySkeleton display={project?.display || 'LIST'} />
}
