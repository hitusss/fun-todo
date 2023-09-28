import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/misc'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const userAvatarVariants = cva('', {
	variants: {
		size: {
			default: 'h-7 w-7',
			sm: 'h-5 w-5',
			lg: 'h-9 w-9',
			xl: 'h-24 w-24',
		},
	},
	defaultVariants: {
		size: 'default',
	},
})

export interface UserAvatarProps
	extends VariantProps<typeof userAvatarVariants> {
	image: string | undefined | null
	name: string
	className?: string
}

export function UserAvatar({ image, name, size, className }: UserAvatarProps) {
	return (
		<Avatar className={cn(userAvatarVariants({ size, className }))}>
			<AvatarImage src={image || undefined} alt="" />
			<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
	)
}
