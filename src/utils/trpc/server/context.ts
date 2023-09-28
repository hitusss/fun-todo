import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/utils/auth'

export async function createContext(opts?: FetchCreateContextFnOptions) {
	const session = await getServerSession(authOptions)
	return {
		session,
		headers: opts && Object.fromEntries(opts.req.headers),
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
