'use client'

import { useSectionDialog } from '@/stores/section-dialog'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

import { SectionForm } from './form'

export function SectionDialog() {
	const { isOpen, onOpenChange, sectionId } = useSectionDialog()
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="w-screen max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{sectionId === 'new' ? 'Create' : 'Edit'} section
					</DialogTitle>
				</DialogHeader>
				<SectionForm />
			</DialogContent>
		</Dialog>
	)
}
