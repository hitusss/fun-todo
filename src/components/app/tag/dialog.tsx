'use client'

import { useTagDialog } from '@/stores/tag-dialog'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

import { TagForm } from './form'

export function TagDialog() {
	const { isOpen, onOpenChange, tagId } = useTagDialog()
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="w-screen max-w-lg">
				<DialogHeader>
					<DialogTitle>{tagId === 'new' ? 'Create' : 'Edit'} tag</DialogTitle>
				</DialogHeader>
				<TagForm />
			</DialogContent>
		</Dialog>
	)
}
