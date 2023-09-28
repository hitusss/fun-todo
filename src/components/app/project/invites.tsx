import { XIcon } from 'lucide-react'

import { ProjectDetail } from 'types'
import { useConfirmDialog } from '@/stores/confirm-dialog'
import { api } from '@/utils/trpc/api/client'
import { UserAvatar } from '@/components/app/user-avatar'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/button'

export function Invites({ invites }: { invites: ProjectDetail['invites'] }) {
	const { open } = useConfirmDialog()

	return (
		<div>
			Invites
			<div className="flex flex-wrap gap-2 py-2">
				{invites.length > 0 ? (
					invites.map(i => (
						<Badge key={i.id} variant="secondary">
							<UserAvatar image={i.user.image} name={i.user.name || ''} />
							<div>
								<p className="text-sm font-medium">{i.user.name}</p>
								<p className="text-xs font-light">{i.role}</p>
							</div>
							<IconButton
								label="Cancel invite"
								variant="ghostPrimary"
								className="ml-2"
								onClick={() =>
									open({
										title: 'Are you sure you want to delete this invite?',
										confirmHandler: async () => {
											await api.memberRouter.cancelInvite.mutate(i.id)
										},
									})
								}
							>
								<XIcon width={16} height={16} />
							</IconButton>
						</Badge>
					))
				) : (
					<p className="text-muted-foreground">No invites</p>
				)}
			</div>
		</div>
	)
}
