import * as React from 'react'
import { CheckIcon, XIcon } from 'lucide-react'

import { UserInvites as UserInvitesType } from 'types'
import { api } from '@/utils/trpc/api/client'
import { UserAvatar } from '@/components/app/user-avatar'
import { IconButton } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'

export function UserInvites({ children }: { children: React.ReactNode }) {
	const [invites, setInvites] = React.useState<UserInvitesType>([])
	const [loading, setLoading] = React.useState(false)

	React.useEffect(() => {
		const fetchInvites = async () => {
			setLoading(true)
			const res = await api.memberRouter.getInvites.query()
			setInvites(res)
			setLoading(false)
		}
		fetchInvites()
	}, [])

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="px-1 md:px-3">
				<DialogHeader>
					<DialogTitle>Invites</DialogTitle>
				</DialogHeader>
				<div>
					{loading ? (
						<div className="grid place-items-center">
							<Spinner />
						</div>
					) : (
						<ScrollArea className="h-full max-h-80" vertical>
							<div className="flex-1 space-y-2">
								{invites.length > 0 ? (
									invites.map(invite => (
										<div
											key={invite.id}
											className="relative flex gap-2 rounded-md bg-accent p-2"
										>
											<span
												className="w-1 rounded-md"
												style={{
													backgroundColor:
														invite.project.color ||
														'hsl(var(--clr-placeholder))',
												}}
											/>
											<div className="flex-1">
												<div className="grid grid-cols-[auto_1fr] items-center">
													<p className="text-xs font-extralight text-muted-foreground">
														Project
													</p>
													<p className="ml-2 font-semibold">
														{invite.project.name}
													</p>
													<p className="text-xs font-extralight text-muted-foreground">
														Role
													</p>
													<p className="ml-2 font-semibold">{invite.role}</p>
													<p className="text-xs font-extralight text-muted-foreground">
														Invited by
													</p>
													<div className="ml-2 flex items-center gap-1">
														<UserAvatar
															image={invite.inviter.image}
															name={invite.inviter.name || ''}
															size="sm"
														/>
														<span className="ml-1">{invite.inviter.name}</span>
													</div>
												</div>
											</div>
											<div className="inline-flex items-end gap-2">
												<IconButton
													variant="outline"
													label="Reject invite"
													onClick={async () => {
														await api.memberRouter.rejectInvite.mutate(
															invite.id,
														)
														setInvites(invites.filter(i => i.id !== invite.id))
													}}
												>
													<XIcon />
												</IconButton>
												<IconButton
													variant="default"
													label="Accept invite"
													onClick={async () => {
														await api.memberRouter.acceptInvite.mutate(
															invite.id,
														)
														setInvites(invites.filter(i => i.id !== invite.id))
													}}
												>
													<CheckIcon />
												</IconButton>
											</div>
										</div>
									))
								) : (
									<p>No invites yet.</p>
								)}
							</div>
						</ScrollArea>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
