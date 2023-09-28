'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/utils/misc'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command'
import { inputVariants } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

export interface ComboboxProps {
	items: {
		label: any
		value:
			| string
			| {
					label: any
					value: string
			  }[]
	}[]
	placeholder?: string
	multiple?: boolean
	initialValue?: string | string[]
	value?: string | string[]
	setValue?: (itemValue: string) => void
	open?: boolean
	setOpen?: (open: boolean) => void
	disabled?: boolean
	className?: string
}

export function Combobox({
	items,
	placeholder = 'Nothing selected',
	multiple = false,
	initialValue = multiple ? [] : '',
	value,
	setValue,
	open,
	setOpen,
	disabled,
	className,
}: ComboboxProps) {
	const id = React.useId()
	const [search, setSearch] = React.useState('')
	const [fallbackOpen, setFallbackOpen] = React.useState(false)
	const [fallbackValue, setFallbackValue] = React.useState<string | string[]>(
		initialValue,
	)

	if (!value) value = fallbackValue

	const onSelect = (itemValue: string) => {
		if (setValue) {
			setValue(itemValue)
		} else {
			setFallbackValue(prev => {
				if (prev instanceof Array) {
					return prev.includes(itemValue)
						? prev.filter(v => v !== itemValue)
						: [...prev, itemValue]
				} else {
					return prev === itemValue ? '' : itemValue
				}
			})
		}
	}

	return (
		<Popover
			open={open ?? fallbackOpen}
			onOpenChange={setOpen ?? setFallbackOpen}
		>
			<PopoverTrigger asChild>
				<button
					role="combobox"
					aria-controls={id}
					aria-expanded={open ?? fallbackOpen}
					className={cn(
						inputVariants(),
						'justify-between',
						(!value || value.length === 0) && 'text-muted-foreground',
						className,
					)}
					disabled={disabled}
				>
					<div className="space-x-1 truncate">
						{(value instanceof Array
							? items.reduce<any[] | undefined>((acc, item) => {
									if (item.value instanceof Array) {
										item.value.map(i => {
											if (value?.includes(i.value)) {
												if (!acc) {
													acc = [i.label]
												} else {
													acc.push(i.label)
												}
											}
										})
										return acc
									} else {
										if (value?.includes(item.value)) {
											if (!acc) {
												acc = [item.label]
											} else {
												acc.push(item.label)
											}
										}
										return acc
									}
							  }, undefined)
							: items.reduce<any | undefined>((acc, item) => {
									if (item.value instanceof Array) {
										item.value.forEach(i => {
											if (value === i.value) {
												acc = i.label
											}
										})
										return acc
									} else {
										if (value === item.value) {
											acc = item.label
										}
										return acc
									}
							  }, undefined)) || placeholder}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Command id={id}>
					<CommandInput
						value={search}
						onValueChange={setSearch}
						placeholder="Search..."
					/>
					<CommandEmpty>No result found.</CommandEmpty>
					{items.map(item => {
						if (item.value instanceof Array) {
							return (
								<CommandGroup key={item.label} heading={item.label}>
									{item.value.map(i => (
										<CommandItem
											key={i.value}
											value={i.value}
											onSelect={onSelect}
										>
											<CheckIcon
												className={cn(
													'mr-2 h-4 w-4',
													(
														multiple
															? value?.includes(i.value)
															: i.value === value
													)
														? 'opacity-100'
														: 'opacity-0',
												)}
											/>
											{i.label}
										</CommandItem>
									))}
								</CommandGroup>
							)
						} else {
							return (
								<CommandItem
									key={item.value}
									value={item.value}
									onSelect={onSelect}
								>
									<CheckIcon
										className={cn(
											'mr-2 h-4 w-4',
											(
												multiple
													? value?.includes(item.value)
													: item.value === value
											)
												? 'opacity-100'
												: 'opacity-0',
										)}
									/>
									{item.label}
								</CommandItem>
							)
						}
					})}
				</Command>
			</PopoverContent>
		</Popover>
	)
}
