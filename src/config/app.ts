import {
	CalendarRangeIcon,
	ClockIcon,
	InboxIcon,
	LucideIcon,
} from 'lucide-react'

export const routes: Record<
	string,
	{ name: string; Icon: LucideIcon; color?: string }
> = {
	'/app/inbox': {
		name: 'Inbox',
		Icon: InboxIcon,
		color: 'hsl(var(--clr-inbox))',
	},
	'/app/today': {
		name: 'Today',
		Icon: ClockIcon,
		color: 'hsl(var(--clr-today))',
	},
	'/app/thisweek': {
		name: 'This week',
		Icon: CalendarRangeIcon,
		color: 'hsl(var(--clr-this-week))',
	},
}
