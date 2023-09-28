'use client'

import { usePathname } from 'next/navigation'

import { useUserProjects } from '@/stores/user-projects'
import { DisplaySkeleton } from '@/components/app/project/display-skeleton'

export default function Loading() {
	const pathname = usePathname()
	const { projects } = useUserProjects()

	const projectId = pathname?.includes('project') ? pathname.split('/')[3] : ''
	const project = projectId ? projects.find(p => p.id === projectId) : null

	return <DisplaySkeleton display={project?.display || 'LIST'} />
}
