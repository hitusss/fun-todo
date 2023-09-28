import { create } from 'zustand'

import { api } from '@/utils/trpc/api/client'
import { SectionSchema } from '@/utils/validators/section'

type State = {
	isOpen: boolean
	projectId: string
	sectionId: string
	order: number
	section: SectionSchema
}

type Action = {
	open: ({
		projectId,
		sectionId,
		order,
		section,
	}: {
		projectId: string
		sectionId: string
		order: number
		section?: SectionSchema
	}) => void
	close: () => void
	onOpenChange: (isOpen: boolean) => void
}

const newSection = (projectId: string, order: number): SectionSchema => ({
	id: 'new',
	name: '',
	projectId,
	order,
})

export const useSectionDialog = create<State & Action>(set => ({
	isOpen: false,
	projectId: '',
	sectionId: '',
	order: 0,
	section: newSection('', 0),
	open: async ({ projectId, sectionId, order, section }) => {
		if (sectionId === 'new') {
			section = newSection(projectId, order)
		} else {
			if (!section) {
				const res =
					await api.sectionRouter.getSectionDetailsById.query(sectionId)
				section = {
					...res,
					order,
				}
			}
			section.order = order
		}
		set({ isOpen: true, projectId, sectionId, order, section })
	},
	close: () =>
		set({
			isOpen: false,
			projectId: '',
			sectionId: '',
			section: newSection('', 0),
		}),
	onOpenChange: isOpen => set({ isOpen }),
}))
