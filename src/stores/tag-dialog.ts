import { create } from 'zustand'

import { api } from '@/utils/trpc/api/client'
import { TagSchema } from '@/utils/validators/tag'

type State = {
	isOpen: boolean
	projectId: string
	tagId: string
	tag: TagSchema
}

type Action = {
	open: ({
		projectId,
		tagId,
		tag,
	}: {
		projectId: string
		tagId: string
		tag?: TagSchema
	}) => void
	close: () => void
	onOpenChange: (isOpen: boolean) => void
}

const newTag = (projectId: string): TagSchema => ({
	id: 'new',
	name: 'new tag',
	bgColor: '#000000',
	textColor: '#ffffff',
	projectId,
})

export const useTagDialog = create<State & Action>(set => ({
	isOpen: false,
	projectId: '',
	tagId: '',
	tag: newTag(''),
	open: async ({ projectId, tagId, tag }) => {
		if (tagId === 'new') {
			tag = newTag(projectId)
		} else {
			if (!tag) tag = await api.tagRouter.getTagDetailsById.query(tagId)
		}
		set({ isOpen: true, projectId, tagId, tag })
	},
	close: () =>
		set({ isOpen: false, projectId: '', tagId: '', tag: newTag('') }),
	onOpenChange: isOpen => set({ isOpen }),
}))
