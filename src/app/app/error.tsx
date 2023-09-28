'use client'

import { Button } from '@/components/ui/button'

export default function Error({
	error,
	reset,
}: {
	error: Error
	reset: () => void
}) {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-8 text-foreground-danger">
			<h2>Something went wrong!</h2>
			<p>{error.message}</p>
			<Button onClick={() => reset()} variant="outline">
				Try again
			</Button>
		</div>
	)
}
