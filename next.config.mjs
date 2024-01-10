/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@prisma/client', '@trpc/server'],
	},
	images: {
		domains: ['res.cloudinary.com', 'cdn.discordapp.com'],
	},
}

export default nextConfig
