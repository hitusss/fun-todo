import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createContext } from '@/utils/trpc/server/context'
import { appRouter } from '@/utils/trpc/server/routers/'

// export const runtime = 'edge'

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req,
		router: appRouter,
		createContext,
	})

export { handler as GET, handler as POST }
