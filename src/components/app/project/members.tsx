import { PlusIcon, TrashIcon } from 'lucide-react'

import { ProjectDetail } from 'types'
import { useConfirmDialog } from '@/stores/confirm-dialog'
import { api } from '@/utils/trpc/api/client'
import { UserAvatar } from '@/components/app/user-avatar'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/button'

import { InviteMember } from './invite'

export function Members({
	projectId,
	members,
}: {
	projectId: string
	members: ProjectDetail['members']
}) {
	const { open } = useConfirmDialog()

	return (
		<>
			<div className="inline-flex w-full items-center justify-between">
				<h4 className="mt-2">Members</h4>
				<InviteMember projectId={projectId}>
					<IconButton label="Invite member">
						<PlusIcon width={16} height={16} />
					</IconButton>
				</InviteMember>
			</div>
			<div className="flex flex-wrap gap-2 py-2">
				{members.map(m => (
					<Badge key={m.user.id} variant="secondary">
						<UserAvatar image={m.user.image} name={m.user.name || ''} />
						<div>
							<p className="text-sm font-medium">{m.user.name}</p>
							<p className="text-xs font-light">{m.role}</p>
						</div>
						{m.role !== 'OWNER' ? (
							<IconButton
								label="remove member"
								variant="ghostPrimary"
								className="ml-2"
								onClick={() =>
									open({
										title: 'Are you sure you want to delete this member?',
										confirmHandler: async () => {
											await api.memberRouter.removeMember.mutate({
												memberId: m.user.id,
												projectId,
											})
										},
									})
								}
							>
								<TrashIcon width={16} height={16} />
							</IconButton>
						) : null}
					</Badge>
				))}
			</div>
		</>
	)
}
