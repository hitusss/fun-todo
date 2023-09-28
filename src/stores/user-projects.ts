import { create } from 'zustand'

import { UserProjects } from 'types'

type State = {
	projects: UserProjects
}

type Action = {
	setProjects: (projects: UserProjects) => void
	addProject: (project: UserProjects[number]) => void
	updateProject: (
		project: Partial<UserProjects[number]> & { id: string },
	) => void
	deleteProject: (projectId: string) => void
	addTag: (tag: UserProjects[number]['tags'][number]) => void
	updateTag: (tag: UserProjects[number]['tags'][number]) => void
	deleteTag: ({ id, projectId }: { id: string; projectId: string }) => void
}

export const useUserProjects = create<State & Action>(set => ({
	projects: [],
	setProjects: projects => set({ projects }),
	addProject: project => {
		set(prev => ({
			projects: [...prev.projects, project],
		}))
	},
	updateProject: project => {
		set(prev => ({
			projects: prev.projects.map(p =>
				p.id === project.id ? { ...p, ...project } : p,
			),
		}))
	},
	deleteProject: projectId => {
		set(prev => ({
			projects: prev.projects.filter(p => p.id !== projectId),
		}))
	},
	addTag: tag => {
		set(prev => ({
			projects: prev.projects.map(p => {
				if (p.id === tag.projectId) {
					p.tags.push(tag)
				}
				return p
			}),
		}))
	},
	updateTag: tag => {
		set(prev => ({
			projects: prev.projects.map(p => {
				if (p.id === tag.projectId) {
					p.tags = p.tags.map(t => (t.id === tag.id ? tag : t))
				}
				return p
			}),
		}))
	},
	deleteTag: ({ id, projectId }) => {
		set(prev => ({
			projects: prev.projects.map(p => {
				if (p.id === projectId) {
					p.tags = p.tags.filter(t => t.id !== id)
				}
				return p
			}),
		}))
	},
}))
