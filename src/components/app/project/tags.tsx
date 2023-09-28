import { EditIcon, PlusIcon } from 'lucide-react'

import { UserProjects } from 'types'
import { useTagDialog } from '@/stores/tag-dialog'
import { Tag } from '@/components/app/tag/tag'
import { IconButton } from '@/components/ui/button'

export function Tags({
	projectId,
	tags,
}: {
	projectId: string
	tags?: UserProjects[number]['tags']
}) {
	const { open } = useTagDialog()

	return (
		<div>
			<div className="inline-flex w-full items-center justify-between">
				<h4 className="mt-2">Tags</h4>
				<IconButton
					label="Add tag"
					onClick={() => {
						open({ projectId, tagId: 'new' })
					}}
				>
					<PlusIcon width={16} height={16} />
				</IconButton>
			</div>
			<div className="flex flex-wrap gap-2 py-2">
				{!!tags && tags.length > 0 ? (
					tags.map(tag => (
						<Tag
							name={tag.name}
							bgColor={tag.bgColor}
							textColor={tag.textColor}
							key={tag.id}
						>
							<IconButton
								label="edit tag"
								onClick={() => {
									open({
										projectId,
										tagId: tag.id,
										tag,
									})
								}}
							>
								<EditIcon
									style={{ color: tag.textColor }}
									width={14}
									height={14}
								/>
							</IconButton>
						</Tag>
					))
				) : (
					<p className="text-muted-foreground	">No tags</p>
				)}
			</div>
		</div>
	)
}
