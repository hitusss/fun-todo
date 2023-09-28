import { create } from 'zustand'

type State = {
	isOpen: boolean
	title: string
	confirmHandler: () => any
}

type Action = {
	open: ({
		title,
		confirmHandler,
	}: {
		title: string
		confirmHandler: () => any
	}) => void
	close: () => void
}

export const useConfirmDialog = create<State & Action>(set => ({
	isOpen: false,
	title: '',
	confirmHandler: () => {},
	open: async ({ title, confirmHandler }) => {
		set({ isOpen: true, title, confirmHandler })
	},
	close: () => set({ isOpen: false, title: '', confirmHandler: () => {} }),
}))
