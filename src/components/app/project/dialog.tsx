'use client'

import * as React from 'react'

import { useProjectDialog } from '@/stores/project-dialog'
import { useUserProjects } from '@/stores/user-projects'
import { cn } from '@/utils/misc'
import { pusherClient, typedBind } from '@/utils/pusher'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ProjectForm } from './form'
import { Invites } from './invites'
import { ProjectLogs } from './logs'
import { Members } from './members'
import { Tags } from './tags'

export function ProjectDialog() {
	const {
		isOpen,
		projectId,
		project,
		onOpenChange,
		addMember,
		removeMember,
		addInvite,
		deleteInvite,
	} = useProjectDialog()
	const { tags } = useUserProjects(state => {
		const p = state.projects.find(p => p.id === projectId)
		return {
			tags: p?.tags,
		}
	})

	const isNew = projectId === 'new'

	React.useEffect(() => {
		if (!projectId) return
		const channel = pusherClient.subscribe(`private-project-${projectId}`)

		typedBind(
			'projectMember:created',
			member => {
				addMember(member)
			},
			channel,
		)
		typedBind(
			'projectMember:deleted',
			memberId => {
				removeMember(memberId)
			},
			channel,
		)

		typedBind(
			'projectInvite:created',
			invite => {
				addInvite(invite)
			},
			channel,
		)
		typedBind(
			'projectInvite:deleted',
			inviteId => {
				deleteInvite(inviteId)
			},
			channel,
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [addInvite, addMember, deleteInvite, projectId, removeMember])

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn('w-screen max-w-lg', {
					'h-[80vh] grid-rows-[auto_auto_1fr]': !isNew,
				})}
			>
				<DialogHeader>
					<DialogTitle>{isNew ? 'Create' : 'Edit'} project</DialogTitle>
				</DialogHeader>
				{!project.inbox ? <ProjectForm /> : null}
				{!isNew ? (
					<Tabs
						defaultValue="projectDetails"
						className="mt-6 flex flex-col gap-2 overflow-hidden"
					>
						<TabsList>
							<TabsTrigger value="projectDetails">Project Details</TabsTrigger>
							<TabsTrigger value="logs">Logs</TabsTrigger>
						</TabsList>
						<TabsContent value="projectDetails" asChild>
							<ScrollArea vertical>
								<div className="space-y-4">
									{!project.inbox ? (
										<Members projectId={projectId} members={project.members} />
									) : null}
									{!project.inbox ? (
										<Invites invites={project.invites} />
									) : null}
									<Tags projectId={projectId} tags={tags} />
								</div>
							</ScrollArea>
						</TabsContent>
						<TabsContent value="logs" asChild>
							<ProjectLogs projectId={projectId} />
						</TabsContent>
					</Tabs>
				) : null}
			</DialogContent>
		</Dialog>
	)
}
