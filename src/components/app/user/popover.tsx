import {
	BellIcon,
	CheckIcon,
	LogOutIcon,
	PaletteIcon,
	SettingsIcon,
	UserPlusIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'

import { NotificationsPopover } from '@/components/app/notifications/popover'
import { SettingsDialog } from '@/components/app/settings/dialog'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

import { UserInvites } from './invites'

export function UserPopover({ children }: { children: React.ReactNode }) {
	const { themes, theme, setTheme } = useTheme()

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				align="start"
				className="flex w-auto min-w-[11rem] flex-col p-1 [&>*]:w-full [&>*]:justify-start"
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="lg" variant="ghost">
							<PaletteIcon /> Theme
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side="right"
						align="end"
						className="[&>*]:justify-between"
					>
						{themes.map(t => (
							<DropdownMenuItem key={t} onClick={() => setTheme(t)}>
								{t} {t === theme ? <CheckIcon width={16} height={16} /> : null}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<UserInvites>
					<Button size="lg" variant="ghost">
						<UserPlusIcon /> Invites
					</Button>
				</UserInvites>

				<NotificationsPopover>
					<Button size="lg" variant="ghost">
						<BellIcon /> Notifications
					</Button>
				</NotificationsPopover>

				<SettingsDialog>
					<Button size="lg" variant="ghost">
						<SettingsIcon /> Settings
					</Button>
				</SettingsDialog>

				<Button variant="destructive" size="lg" onClick={() => signOut()}>
					<LogOutIcon /> LogOut
				</Button>
			</PopoverContent>
		</Popover>
	)
}
