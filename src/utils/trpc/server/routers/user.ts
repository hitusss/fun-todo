import { v2 as cloudinary } from 'cloudinary'

import { prisma } from '@/utils/prisma'
import { userSchema } from '@/utils/validators/user'

import { protectedProcedure, router } from '../index'

export const userRouter = router({
	onboarding: protectedProcedure
		.input(userSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedUser = prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: input,
				select: {
					id: true,
					name: true,
				},
			})
			return updatedUser
		}),
	updateUser: protectedProcedure
		.input(userSchema)
		.mutation(async ({ input, ctx }) => {
			if (input.image) {
				cloudinary.config({
					cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
					api_key: process.env.CLOUDINARY_API_KEY as string,
					api_secret: process.env.CLOUDINARY_API_SECRET as string,
					secure: true,
				})
				const image = await cloudinary.uploader.upload(input.image, {
					upload_preset: 'fun-todo-user-avatar',
					filename_override: ctx.session.user.id,
				})
				input.image = image.secure_url
			}

			const updatedUser = prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: input,
				select: {
					id: true,
				},
			})
			return updatedUser
		}),
})
