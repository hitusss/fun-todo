/** @type {import('next').NextConfig} */
const nextConfig = {
	/* need disable strick mode for dnd */
	reactStrictMode: false,
	experimental: {
		serverComponentsExternalPackages: ['@prisma/client', '@trpc/server'],
	},
	images: {
		domains: ['res.cloudinary.com', 'cdn.discordapp.com'],
	},
}

export default nextConfig
