'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { BellIcon, PlusIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { routes } from '@/config/app'
import { useProjectDialog } from '@/stores/project-dialog'
import { useUserNotifications } from '@/stores/user-notifications'
import { useUserProjects } from '@/stores/user-projects'
import useLocalStorage from '@/utils/hooks/use-local-storage'
import { cn } from '@/utils/misc'
import { NotificationsPopover } from '@/components/app/notifications/popover'
import { UserAvatar } from '@/components/app/user-avatar'
import { UserPopover } from '@/components/app/user/popover'
import { buttonVariants, IconButton } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

export function NavButton({
	pathname,
	path,
	name,
	open,
	children,
}: {
	pathname: string | null
	path: string
	name: string
	open: boolean
	children: React.ReactNode
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={path} className="w-full">
					<motion.div
						variants={{
							open: {
								maxWidth: '16.75rem',
								justifyContent: 'flex-start',
							},
							close: {
								maxWidth: '2.25rem',
								transitionEnd: {
									justifyContent: 'center',
								},
							},
						}}
						animate={open ? 'open' : 'close'}
						transition={{
							duration: 0.1,
						}}
						className={cn(
							buttonVariants({
								variant: pathname === path ? 'default' : 'ghost',
							}),
							'w-full',
						)}
					>
						<div className="h-4 w-4">{children}</div>
						<motion.span
							variants={{
								open: {
									display: 'block',
									opacity: 1,
									scale: 1,
									transition: {
										delay: 0.05,
									},
								},
								close: {
									opacity: 0,
									scale: 0,
									transitionEnd: {
										display: 'none',
									},
								},
							}}
							animate={open ? 'open' : 'close'}
							transition={{
								duration: 0.1,
							}}
						>
							{name}
						</motion.span>
					</motion.div>
				</Link>
			</TooltipTrigger>
			<TooltipContent side="right">{name}</TooltipContent>
		</Tooltip>
	)
}

export function SideBar() {
	const pathname = usePathname()
	const session = useSession({ required: true })
	const { projects } = useUserProjects()
	const { open: openProjectDialog } = useProjectDialog()
	const { notificationCount } = useUserNotifications()

	const [open, setOpen] = useLocalStorage('sidebar-open', true)

	return (
		<motion.aside
			key="sidebar"
			variants={{
				open: {
					maxWidth: '18rem',
				},
				close: {
					maxWidth: '3rem',
				},
			}}
			animate={open ? 'open' : 'close'}
			transition={{
				duration: 0.15,
			}}
			className="relative flex h-full w-72 flex-col justify-between gap-4 overflow-hidden"
		>
			<button
				className="absolute right-2 top-2 z-50 flex h-8 w-8 flex-col justify-around p-1 text-primary"
				onClick={() => setOpen(!open)}
			>
				<motion.span
					variants={{
						open: {
							rotate: 45,
						},
						close: {
							rotate: 0,
						},
					}}
					animate={open ? 'open' : 'close'}
					transition={{
						duration: 0.1,
					}}
					className="block h-[2px] w-6 origin-left bg-primary"
				/>
				<motion.span
					variants={{
						open: {
							opacity: 0,
						},
						close: {
							opacity: 1,
						},
					}}
					animate={open ? 'open' : 'close'}
					transition={{
						duration: 0.1,
					}}
					className="block h-[2px] w-6 bg-primary"
				/>
				<motion.span
					variants={{
						open: {
							rotate: -45,
						},
						close: {
							rotate: 0,
						},
					}}
					animate={open ? 'open' : 'close'}
					transition={{
						duration: 0.1,
					}}
					className="block h-[2px] w-6 origin-left bg-primary"
				/>
			</button>

			<motion.div
				variants={{
					open: {
						opacity: 1,
						scale: 1,
					},
					close: {
						opacity: 0,
						scale: 0.2,
					},
				}}
				animate={open ? 'open' : 'close'}
				className="grid origin-left place-items-center pt-12"
			>
				<h1 aria-label="fun todo logo">
					<Logo className="h-auto w-44" />
				</h1>
			</motion.div>

			<motion.nav
				variants={{
					open: {
						paddingInline: '0.625rem',
					},
					close: {
						paddingInline: '0.375rem',
					},
				}}
				animate={open ? 'open' : 'close'}
				transition={{
					duration: 0.1,
				}}
				className="flex max-h-[60%] origin-left flex-col gap-4 overflow-hidden py-4"
			>
				<div className="flex flex-col items-center gap-2">
					{Object.entries(routes).map(([path, { name, Icon, color }]) => (
						<NavButton
							key={path}
							pathname={pathname}
							path={path}
							name={name}
							open={open}
						>
							<Icon width={16} height={16} style={{ color }} />
						</NavButton>
					))}
				</div>

				<motion.div
					variants={{
						open: {
							justifyContent: 'space-between',
						},
						close: {
							transitionEnd: {
								justifyContent: 'center',
							},
						},
					}}
					animate={open ? 'open' : 'close'}
					transition={{
						duration: 0.1,
					}}
					className="flex items-center"
				>
					<motion.h4
						variants={{
							open: {
								display: 'block',
								opacity: 1,
								scale: 1,
								transition: {
									delay: 0.05,
								},
							},
							close: {
								opacity: 0,
								scale: 0,
								transitionEnd: {
									display: 'none',
								},
							},
						}}
						animate={open ? 'open' : 'close'}
						transition={{
							duration: 0.1,
						}}
						className={cn(open ? 'block' : 'hidden')}
					>
						Projects
					</motion.h4>
					<IconButton
						onClick={() => openProjectDialog('new')}
						label="Create new project"
					>
						<PlusIcon />
					</IconButton>
				</motion.div>

				<ScrollArea vertical>
					<div className="flex w-full flex-col items-center gap-2">
						{projects.map(({ inbox, id, name, color }) => {
							if (inbox) return null
							const path = `/app/project/${id}`
							return (
								<NavButton
									key={path}
									pathname={pathname}
									path={path}
									name={name}
									open={open}
								>
									<span
										className="grid aspect-square w-5 place-content-center rounded-full text-xs text-white"
										style={{
											backgroundColor: color ?? 'hsl(var(--clr-placeholder))',
										}}
									>
										{name.slice(0, 2).toUpperCase()}
									</span>
								</NavButton>
							)
						})}
					</div>
				</ScrollArea>
			</motion.nav>

			<motion.div
				variants={{
					open: {
						paddingInline: '0.625rem',
					},
					close: {
						paddingInline: '0.375rem',
					},
				}}
				animate={open ? 'open' : 'close'}
				transition={{
					duration: 0.1,
				}}
				className="flex h-16 items-center gap-4 border-t bg-accent text-accent-foreground"
			>
				<UserPopover>
					<motion.button
						variants={{
							open: {
								maxWidth: '16.75rem',
								justifyContent: 'flex-start',
							},
							close: {
								maxWidth: '2.25rem',
								transitionEnd: {
									justifyContent: 'center',
								},
							},
						}}
						animate={open ? 'open' : 'close'}
						transition={{
							duration: 0.1,
						}}
						className={cn(
							buttonVariants({
								variant: 'ghostPrimary',
							}),
							'flex-1 select-none',
							// open ? 'h-12 flex-1 justify-start' : 'h-8 w-8 px-0',
						)}
					>
						<UserAvatar
							image={session.data?.user?.image}
							name={session.data?.user?.name || ''}
						/>
						<motion.span
							variants={{
								open: {
									display: 'block',
									opacity: 1,
									scale: 1,
									transition: {
										delay: 0.05,
									},
								},
								close: {
									opacity: 0,
									scale: 0,
									transitionEnd: {
										display: 'none',
									},
								},
							}}
							animate={open ? 'open' : 'close'}
							transition={{
								duration: 0.1,
							}}
							className="font-medium"
						>
							{session.data?.user?.name}
						</motion.span>
					</motion.button>
				</UserPopover>

				{open ? (
					<NotificationsPopover>
						<IconButton label="Notifications" variant="ghostPrimary">
							{notificationCount > 0 ? (
								<span className="absolute right-1 top-1 grid h-5 w-5 place-content-center rounded-full bg-destructive text-xs text-destructive-foreground">
									{notificationCount >= 100 ? '99' : notificationCount}
								</span>
							) : null}

							<BellIcon />
						</IconButton>
					</NotificationsPopover>
				) : null}
			</motion.div>
		</motion.aside>
	)
}
