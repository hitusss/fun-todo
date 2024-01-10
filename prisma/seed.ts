import { faker } from '@faker-js/faker'

import { prisma } from '@/utils/prisma'

async function createUser(email: string) {
	const user = await prisma.user.create({
		data: {
			email: email,
			name: faker.internet.userName(),
			image: faker.internet.avatar(),
		},
	})
	await prisma.project.create({
		data: {
			inbox: user.id,
			name: 'Inbox',
			members: {
				create: {
					userId: user.id,
					role: 'OWNER',
				},
			},
		},
	})
	return user
}

async function createProject(userId: string) {
	const project = await prisma.project.create({
		data: {
			name: faker.word.adjective({ length: { min: 4, max: 16 } }),
			color: faker.color.rgb(),
			members: {
				create: {
					userId: userId,
					role: 'OWNER',
				},
			},
		},
	})
	const sections = await Promise.all(
		Array.from(
			{
				length: faker.number.int({ min: 3, max: 6 }),
			},
			async (_, i) =>
				await prisma.section.create({
					data: {
						name: faker.word.adjective({ length: { min: 4, max: 16 } }),
						projectId: project.id,
						order: i,
					},
				}),
		),
	)
	const tags = await Promise.all(
		Array.from(
			{
				length: faker.number.int({ min: 3, max: 6 }),
			},
			async () =>
				await prisma.tag.create({
					data: {
						name: faker.word.adjective({ length: { min: 4, max: 8 } }),
						bgColor: faker.color.rgb(),
						textColor: faker.color.rgb(),
						projectId: project.id,
					},
				}),
		),
	)

	Array.from(
		{
			length: faker.number.int({ min: 12, max: 32 }),
		},
		async (_, i) => {
			await prisma.task.create({
				data: {
					title: faker.word.conjunction({ length: { min: 6, max: 64 } }),
					description: faker.datatype.boolean({ probability: 0.35 })
						? faker.lorem.paragraph()
						: undefined,
					dueDate: faker.datatype.boolean({ probability: 0.35 })
						? faker.date.future()
						: undefined,
					order: i,
					projectId: project.id,
					sectionId:
						sections[faker.number.int({ min: 0, max: sections.length - 1 })].id,
					tags: {
						connect: Array.from(
							new Set(
								Array.from(
									{
										length: faker.number.int({ min: 0, max: 2 }),
									},
									() =>
										tags[faker.number.int({ min: 1, max: tags.length - 1 })].id,
								),
							),
						).map(tagId => ({
							id: tagId,
						})),
					},
				},
			})
		},
	)

	return project
}

async function createMembersAndInvites(
	user: Awaited<ReturnType<typeof createUser>>,
	projects: Awaited<ReturnType<typeof createProject>>[],
	data: {
		user: Awaited<ReturnType<typeof createUser>>
	}[],
) {
	await Promise.all(
		projects.map(async project => {
			const members = Array.from(
				new Set(
					Array.from(
						{ length: faker.number.int({ min: 1, max: 8 }) },
						() =>
							faker.helpers.arrayElement(
								data.filter(d => d.user.id !== user.id),
							).user.id,
					),
				),
			)
			await prisma.member.createMany({
				data: members.map(userId => ({
					userId,
					projectId: project.id,
					role: faker.helpers.arrayElement(projectRoles),
				})),
			})
			const invites = Array.from(
				new Set(
					Array.from(
						{ length: faker.number.int({ min: 0, max: 4 }) },
						() =>
							faker.helpers.arrayElement(
								data.filter(
									d => d.user.id !== user.id && !members.includes(d.user.id),
								),
							).user.id,
					),
				),
			)
			await prisma.projectInvite.createMany({
				data: invites.map(userId => ({
					userId,
					projectId: project.id,
					inviterId: user.id,
					role: faker.helpers.arrayElement(projectRoles),
				})),
			})
		}),
	)
}

const projectRoles = ['ADMIN', 'EDITOR', 'VIEWER'] as const

async function seed() {
	console.log('🌱 Seeding...')

	console.time('🧹 Cleaned up the database')

	await prisma.taskLog.deleteMany()
	await prisma.taskComment.deleteMany()
	await prisma.task.deleteMany()
	await prisma.tag.deleteMany()
	await prisma.section.deleteMany()
	await prisma.projectInvite.deleteMany()
	await prisma.member.deleteMany()
	await prisma.projectLog.deleteMany()
	await prisma.project.deleteMany()
	await prisma.session.deleteMany()
	await prisma.user.deleteMany()
	await prisma.account.deleteMany()
	await prisma.verificationToken.deleteMany()

	console.timeEnd('🧹 Cleaned up the database')

	console.time(`🌱 Database has been seeded`)

	const mainUser = await createUser('me@funtodo.com')
	const mainProjects = await Promise.all(
		Array.from(
			{ length: faker.number.int({ min: 2, max: 6 }) },
			async () => await createProject(mainUser.id),
		),
	)

	const data = await Promise.all(
		Array.from(
			{
				length: 16,
			},
			async (_, i) => {
				const user = await createUser(`user${i}@funtodo.com`)
				const projects = await Promise.all(
					Array.from(
						{ length: faker.number.int({ min: 2, max: 6 }) },
						async () => await createProject(user.id),
					),
				)
				return {
					user,
					projects,
				}
			},
		),
	)

	await createMembersAndInvites(mainUser, mainProjects, data)

	await Promise.all(
		data.map(async d => {
			await createMembersAndInvites(d.user, d.projects, [
				...data,
				{ user: mainUser },
			])
		}),
	)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
