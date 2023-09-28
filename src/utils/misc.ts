import { clsx, type ClassValue } from 'clsx'
import ms from 'ms'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
	if (!timestamp) return 'never'
	return `${ms(Date.now() - new Date(timestamp).getTime())}${
		timeOnly ? '' : ' ago'
	}`
}

export function nFormatter(num: number, digits?: number) {
	if (!num) return '0'
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'K' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'G' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	]
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
	const item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return num >= item.value
		})
	return item
		? (num / item.value).toFixed(digits || 1).replace(rx, '$1') + item.symbol
		: '0'
}

export function capitalize(str: string) {
	if (!str || typeof str !== 'string') return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const truncate = (str: string, length: number) => {
	if (!str || str.length <= length) return str
	return `${str.slice(0, length)}...`
}

export function todayDate() {
	const startOfDay = new Date()
	startOfDay.setUTCHours(0, 0, 0, 0)
	const endOfDay = new Date()
	endOfDay.setUTCHours(23, 59, 59, 999)

	return { startOfDay, endOfDay }
}

export function thisWeekDate() {
	const curr = new Date()
	const first = curr.getDate() - curr.getDay()
	const last = first + 6

	const startOfWeek = new Date(curr.setDate(first))
	startOfWeek.setUTCHours(0, 0, 0, 0)
	const endOfWeek = new Date(curr.setDate(last))
	endOfWeek.setUTCHours(23, 59, 59, 999)

	return { startOfWeek, endOfWeek }
}

export function isToday(date: Date) {
	const { startOfDay, endOfDay } = todayDate()
	if (date >= startOfDay && date <= endOfDay) return true
	return false
}

export function isThisWeek(date: Date) {
	const { startOfWeek, endOfWeek } = thisWeekDate()
	if (date >= startOfWeek && date <= endOfWeek) return true
	return false
}
