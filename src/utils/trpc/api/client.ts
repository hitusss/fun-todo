'use client'

import { loggerLink } from '@trpc/client'
import {
	experimental_createActionHook,
	experimental_createTRPCNextAppDirClient,
	experimental_serverActionLink,
} from '@trpc/next/app-dir/client'
import { experimental_nextHttpLink } from '@trpc/next/app-dir/links/nextHttp'
import superjson from 'superjson'

import { AppRouter } from '@/utils/trpc/server/routers'

import { getUrl } from './shared'

export const api = experimental_createTRPCNextAppDirClient<AppRouter>({
	config() {
		return {
			transformer: superjson,
			links: [
				loggerLink({
					enabled: () => process.env.NODE_ENV === 'development',
				}),
				experimental_nextHttpLink({
					batch: true,
					url: getUrl(),
					headers() {
						return {
							'x-trpc-source': 'client',
						}
					},
				}),
			],
		}
	},
})

export const useAction = experimental_createActionHook({
	links: [loggerLink(), experimental_serverActionLink()],
	transformer: superjson,
})
