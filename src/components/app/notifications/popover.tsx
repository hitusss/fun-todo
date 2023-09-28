import { AnimatePresence } from 'framer-motion'
import { CheckCheckIcon, ListXIcon } from 'lucide-react'

import { useUserNotifications } from '@/stores/user-notifications'
import { api } from '@/utils/trpc/api/client'
import { IconButton } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Notification } from './notification'

export function NotificationsPopover({
	children,
}: {
	children: React.ReactNode
}) {
	const { notifications } = useUserNotifications()
	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-screen	 max-w-sm p-0">
				<div className="inline-flex w-full items-center justify-between border-b bg-secondary px-3 py-2 font-semibold">
					<p>Notifications</p>
					<div>
						<IconButton
							label="Delete all notifications"
							variant="ghostPrimary"
							onClick={() =>
								api.notificationRouter.deleteAllNotification.mutate()
							}
						>
							<ListXIcon width={20} height={20} />
						</IconButton>
						<IconButton
							label="Mark all notifications as read"
							variant="ghostPrimary"
							onClick={() =>
								api.notificationRouter.markAllNotificationAsRead.mutate()
							}
						>
							<CheckCheckIcon width={20} height={20} />
						</IconButton>
					</div>
				</div>
				<ScrollArea vertical className="max-h-[50vh]">
					<div className="min-h-[6rem] w-full space-y-1 p-2">
						<AnimatePresence>
							{notifications.length > 0 ? (
								notifications.map((notification, index) => (
									<Notification
										key={notification.id}
										notification={notification}
										index={index}
									/>
								))
							) : (
								<div className="grid h-full w-full place-items-center">
									<p className="text-muted-foreground">No notifications yet</p>
								</div>
							)}
						</AnimatePresence>
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	)
}
