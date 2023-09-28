'use client'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import { AccountSettings } from './account'

export function SettingsDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="h-[80vh] w-screen max-w-3xl grid-rows-[auto_1fr]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>
				<AccountSettings />
			</DialogContent>
		</Dialog>
	)
}
