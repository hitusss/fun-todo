import { cn } from '@/utils/misc'

type TagProps = {
	name: string
	bgColor: string
	textColor: string
} & React.HTMLAttributes<HTMLDivElement>

export function Tag({
	name,
	bgColor,
	textColor,
	children,
	className,
	...props
}: TagProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold',
				className,
			)}
			style={{ backgroundColor: bgColor, color: textColor }}
			{...props}
		>
			{name}
			{children}
		</div>
	)
}
