'use client'

import * as React from 'react'

import { useConfirmDialog } from '@/stores/confirm-dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

export function ConfirmDialog() {
	const [loading, setLoading] = React.useState(false)
	const { isOpen, title, confirmHandler, close } = useConfirmDialog()
	return (
		<AlertDialog open={isOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={close} disabled={loading}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={async () => {
							setLoading(true)
							await confirmHandler()
							setLoading(false)
							close()
						}}
						disabled={loading}
					>
						Confirm {loading ? <Spinner className="h-5 w-5" /> : null}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
