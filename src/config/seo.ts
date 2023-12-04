const applicationName = 'FunTODO'
const description =
	'The web app Todo List is a convenient and user-friendly tool designed to help you stay organized and manage your tasks effectively. With its intuitive interface, you can easily create, prioritize, and track your to-do items, ensuring that nothing falls through the cracks. '

export const seo = {
	metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
	title: {
		template: `%s | ${applicationName}`,
		default: applicationName,
	},
	description,
	authors: [{ name: 'Hitusss', url: 'https://github.com/hitusss/' }],
	keywords: [
		'Todo List',
		'Task Management',
		'Task Organizer',
		'Productivity Tool',
		'Task Tracking',
		'Task Prioritization',
		'Deadline Management',
		'Time Management',
		'Workflow Management',
		'Reminders',
		'Task Categorization',
		'Team Collaboration',
		'Efficiency Boost',
		'Online To-Do List',
		'Task Scheduler',
		'Personal Task Manager',
		'Project Management',
	],
	robots: '',
	icons: [],
	manifest: '',
	openGraph: {
		type: 'website',
		url: 'https://example.com',
		title: {
			template: `%s | ${applicationName}`,
			default: applicationName,
		},
		description,
		siteName: applicationName,
		images: [
			{
				url: 'https://example.com/og.png',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@site',
		creator: '@creator',
		title: {
			template: `%s | ${applicationName}`,
			default: applicationName,
		},
		description,
		images: [
			{
				url: 'https://example.com/og.png',
			},
		],
	},
}
