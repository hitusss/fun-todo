'use client'

import { usePathname } from 'next/navigation'
import { EditIcon, Settings2Icon } from 'lucide-react'

import { routes } from '@/config/app'
import { useProjectDialog } from '@/stores/project-dialog'
import { useUserProjects } from '@/stores/user-projects'
import { IconButton } from '@/components/ui/button'

import { ProjectSettingsPopover } from './project-settings/popover'

export function Header() {
	const pathname = usePathname()
	const { projects } = useUserProjects()
	const { open } = useProjectDialog()

	const projectId = pathname?.includes('project') ? pathname.split('/')[3] : ''
	const project = projectId
		? projects.find(p => p.id === projectId)
		: pathname.includes('inbox')
		? projects.find(p => p.inbox)
		: null

	const currentRoute = project ? project?.name : routes[pathname || '']?.name

	return (
		<header className="flex h-14 shrink-0 grow-0 items-center justify-between gap-6 overflow-hidden px-4">
			<h3>{currentRoute}</h3>

			<div className="flex gap-3">
				{project ? (
					project.members[0].role === 'ADMIN' ||
					project.members[0].role === 'OWNER' ? (
						<>
							<ProjectSettingsPopover
								projectId={project.id}
								display={project.display}
								showCompleted={project.showCompleted}
								taskOrder={project.taskOrder}
							>
								<IconButton label="Project preferences">
									<Settings2Icon width={16} height={16} />
								</IconButton>
							</ProjectSettingsPopover>
							<IconButton onClick={() => open(project.id)} label="Edit project">
								<EditIcon width={16} height={16} />
							</IconButton>
						</>
					) : null
				) : null}
			</div>
		</header>
	)
}
