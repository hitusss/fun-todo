import { getUserNotifications } from '@/models/notification'
import { getUserProjects } from '@/models/project'
import { getRequiredUser } from '@/utils/auth'
import { ConfirmDialog } from '@/components/app/confirm-dialog'
import { PageProvider } from '@/components/app/page-layout'
import { ProjectDialog } from '@/components/app/project/dialog'
import { SectionDialog } from '@/components/app/section/dialog'
import { SideBar } from '@/components/app/sidebar'
import { TagDialog } from '@/components/app/tag/dialog'
import { TaskDetails } from '@/components/app/task/details/dialog'
import { TaskDialog } from '@/components/app/task/dialog'

import Providers from './providers'

export default async function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	const user = await getRequiredUser()
	const projects = await getUserProjects()
	const notifications = await getUserNotifications()

	return (
		<Providers
			userId={user.id}
			projects={projects}
			notifications={notifications}
		>
			<ProjectDialog />
			<TagDialog />
			<SectionDialog />
			<TaskDialog />
			<TaskDetails />
			<ConfirmDialog />
			<div className="grid h-screen w-screen grid-cols-[auto_1fr]">
				<SideBar />
				<div className="relative h-full w-full overflow-hidden">
					<PageProvider>{children}</PageProvider>
				</div>
			</div>
		</Providers>
	)
}
