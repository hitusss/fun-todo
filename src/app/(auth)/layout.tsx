export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid h-screen w-screen place-items-center bg-accent">
			<div className="w-full max-w-sm space-y-4 rounded-md border bg-background p-6 text-foreground shadow-lg">
				{children}
			</div>
		</div>
	)
}
