import { z } from 'zod'

import { getProjectLogs } from '@/models/logs/project'
import { getTaskLogs } from '@/models/logs/task'

import { protectedProcedure, router } from '../index'

export const logsRouter = router({
	getProjectLogs: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const logs = await getProjectLogs(input)
			return logs
		}),
	getTaskLogs: protectedProcedure.input(z.string()).query(async ({ input }) => {
		const logs = await getTaskLogs(input)
		return logs
	}),
})
