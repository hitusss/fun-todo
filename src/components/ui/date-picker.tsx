'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DayPickerSingleProps } from 'react-day-picker'

import { cn } from '@/utils/misc'
import { Calendar } from '@/components/ui/calendar'
import { inputVariants } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
	placeholder?: string
	inputClassName?: string
	mode?: 'single'
} & Omit<DayPickerSingleProps, 'mode'>

export function DatePicker({
	placeholder = 'Pick a date',
	inputClassName,
	mode = 'single',
	initialFocus = true,
	selected,
	onSelect,
	...props
}: DatePickerProps) {
	const [date, setDate] = React.useState<Date>()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					className={cn(
						inputVariants(),
						(selected ? !selected : !date) && 'text-muted-foreground',
						inputClassName,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{selected ? (
						format(selected, 'PPP')
					) : date ? (
						format(date, 'PPP')
					) : (
						<span>{placeholder}</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode={mode}
					initialFocus={initialFocus}
					selected={selected ?? date}
					onSelect={onSelect ?? setDate}
					{...props}
				/>
			</PopoverContent>
		</Popover>
	)
}
