'use client'

import { DisplaySkeleton } from '@/components/app/project/display-skeleton'

export default function Loading() {
	return <DisplaySkeleton display={'LIST'} minSections={1} maxSections={1} />
}
