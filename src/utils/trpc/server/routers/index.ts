import { router } from '../index'
import { logsRouter } from './logs'
import { memberRouter } from './member'
import { notificationRouter } from './notification'
import { projectRouter } from './project'
import { reorderRouter } from './reorder'
import { sectionRouter } from './section'
import { tagRouter } from './tag'
import { taskRouter } from './task'
import { userRouter } from './user'

export const appRouter = router({
	userRouter,
	projectRouter,
	sectionRouter,
	tagRouter,
	taskRouter,
	memberRouter,
	reorderRouter,
	notificationRouter,
	logsRouter,
})

export type AppRouter = typeof appRouter
