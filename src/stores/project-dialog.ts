import { create } from 'zustand'

import { ProjectDetail } from 'types'
import { api } from '@/utils/trpc/api/client'
import { ProjectSchema } from '@/utils/validators/project'

type Project = ProjectSchema &
	Pick<ProjectDetail, 'inbox' | 'members' | 'invites'>

type State = {
	isOpen: boolean
	projectId: string
	project: Project
}

type Action = {
	open: (id: string) => void
	close: () => void
	onOpenChange: (isOpen: boolean) => void
	addMember: (member: ProjectDetail['members'][number]) => void
	removeMember: (memberId: string) => void
	addInvite: (invite: ProjectDetail['invites'][number]) => void
	deleteInvite: (inviteId: string) => void
}

const newProject: Project = {
	id: 'new',
	inbox: null,
	name: '',
	color: '#000000',
	members: [],
	invites: [],
}

export const useProjectDialog = create<State & Action>(set => ({
	isOpen: false,
	projectId: '',
	project: newProject,
	open: async projectId => {
		let project: Project
		if (projectId === 'new') {
			project = newProject
		} else {
			const res = await api.projectRouter.getProjectDetailById.query(projectId)
			project = {
				...res,
				color: res.color || undefined,
			}
		}
		set({ isOpen: true, projectId, project })
	},
	close: () => set({ isOpen: false, projectId: '', project: newProject }),
	onOpenChange: isOpen => set({ isOpen }),
	addMember: member => {
		set(state => ({
			project: {
				...state.project,
				members: [...state.project.members, member],
			},
		}))
	},
	removeMember: memberId => {
		set(state => ({
			project: {
				...state.project,
				members: state.project.members.filter(
					member => member.user.id !== memberId,
				),
			},
		}))
	},
	addInvite: invite => {
		set(state => ({
			project: {
				...state.project,
				invites: [...state.project.invites, invite],
			},
		}))
	},
	deleteInvite: inviteId => {
		set(state => ({
			project: {
				...state.project,
				invites: state.project.invites.filter(invite => invite.id !== inviteId),
			},
		}))
	},
}))
