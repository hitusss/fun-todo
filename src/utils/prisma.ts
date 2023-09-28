import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
	prisma: PrismaClient | undefined
}

export let prisma: PrismaClient

if (typeof window === 'undefined') {
	prisma =
		globalForPrisma.prisma ??
		new PrismaClient({
			// log: ["query"],
		})

	if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}
