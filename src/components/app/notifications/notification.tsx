import * as React from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

import { UserNotifications } from 'types'
import useIntersectionObserver from '@/utils/hooks/use-intersection-observer'
import { api } from '@/utils/trpc/api/client'
import { IconButton } from '@/components/ui/button'

export function Notification({
	notification,
	index,
}: {
	notification: UserNotifications[number]
	index: number
}) {
	const notificationRef = React.useRef<HTMLDivElement>(null)
	const observer = useIntersectionObserver(notificationRef, {
		freezeOnceVisible: true,
	})

	React.useEffect(() => {
		return () => {
			if (!notification.read && observer?.isIntersecting) {
				api.notificationRouter.markNotificationAsRead.mutate(notification.id)
			}
		}
	}, [notification.id, notification.read, observer?.isIntersecting])

	return (
		<motion.div
			initial={{ opacity: 0, translateX: '100%' }}
			animate={{
				opacity: notification.read ? 0.5 : 1,
				translateX: '0%',
				transition: { duration: 0.3, delay: 0.01 * index },
			}}
			exit={{
				opacity: 0,
				translateX: '100%',
				transition: { duration: 0.3 },
			}}
			ref={notificationRef}
			className="flex justify-between gap-2 rounded-md bg-secondary p-2 text-secondary-foreground"
		>
			<div>
				<p className="text-md font-semibold">{notification.title}</p>
				<p className="text-xs text-muted-foreground">
					{notification.description}
				</p>
				<p className="text-xs text-muted-foreground">
					{format(new Date(notification.createdAt), 'PPpp')}
				</p>
			</div>
			<div>
				<IconButton
					label="delete notification"
					variant="ghostPrimary"
					className="h-6 w-6"
					onClick={() =>
						api.notificationRouter.deleteNotification.mutate(notification.id)
					}
				>
					<XIcon width={16} height={16} />
				</IconButton>
			</div>
		</motion.div>
	)
}
