import * as React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { cn } from '@/utils/misc'
import { inputVariants } from '@/components/ui/input'

const Textarea = React.forwardRef<
	React.ElementRef<typeof TextareaAutosize>,
	React.ComponentPropsWithoutRef<typeof TextareaAutosize>
>(({ className, minRows = 2, ...props }, ref) => {
	return (
		<TextareaAutosize
			className={cn(inputVariants(), 'resize-none', className)}
			ref={ref}
			minRows={minRows}
			{...props}
		/>
	)
})
Textarea.displayName = 'Textarea'

export { Textarea }
