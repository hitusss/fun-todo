import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/misc'

import { Spinner } from './spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				ghostPrimary: 'hover:bg-primary hover:text-primary-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 px-3 text-xs',
				lg: 'h-10 px-8',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)
Button.displayName = 'Button'

export interface IconButtonProps extends ButtonProps {
	label: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ label, children, variant = 'ghost', size = 'icon', ...props }, ref) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					ref={ref}
					variant={variant}
					size={size}
					{...props}
					aria-label={label}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{label}</p>
			</TooltipContent>
		</Tooltip>
	),
)
IconButton.displayName = 'IconButton'

export interface StatusButton extends ButtonProps {
	status?: 'loading'
}

const StatusButton = React.forwardRef<HTMLButtonElement, StatusButton>(
	({ status, children, ...props }, ref) => (
		<Button ref={ref} {...props}>
			{children}
			{status === 'loading' ? <Spinner className="h-5 w-5" /> : null}
		</Button>
	),
)
StatusButton.displayName = 'StatusButton'

export { Button, IconButton, buttonVariants, StatusButton }
