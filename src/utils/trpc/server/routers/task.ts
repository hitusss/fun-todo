import { z } from 'zod'

import {
	createTask,
	createTaskComment,
	deleteTask,
	deleteTaskComment,
	getTaskComments,
	getTaskDetails,
	toggleCompleteTask,
	updateTask,
	updateTaskComment,
} from '@/models/task'
import { taskCommentSchema, taskSchema } from '@/utils/validators/task'

import { protectedProcedure, router } from '../index'

export const taskRouter = router({
	getTaskDetailsById: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const task = await getTaskDetails(input)
			return task
		}),
	createTask: protectedProcedure
		.input(taskSchema)
		.mutation(async ({ input }) => {
			const task = await createTask(input)
			return task
		}),
	updateTask: protectedProcedure
		.input(taskSchema)
		.mutation(async ({ input }) => {
			const task = await updateTask(input)
			return task
		}),
	deleteTask: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const task = deleteTask(input)
			return task
		}),
	toggleCompleteTask: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const task = await toggleCompleteTask(input)
			return task
		}),
	getTaskComments: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const comments = await getTaskComments(input)
			return comments
		}),
	createTaskComment: protectedProcedure
		.input(taskCommentSchema)
		.mutation(async ({ input }) => {
			const comment = await createTaskComment(input)
			return comment
		}),
	updateTaskComment: protectedProcedure
		.input(taskCommentSchema)
		.mutation(async ({ input }) => {
			const comment = await updateTaskComment(input)
			return comment
		}),
	deleteTaskComment: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const comment = deleteTaskComment(input)
			return comment
		}),
})
