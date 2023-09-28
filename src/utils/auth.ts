import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getServerSession, NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import EmailProvider from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'

import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	providers: [
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST as string,
				port: process.env.EMAIL_SERVER_PORT as string,
				auth: {
					user: process.env.EMAIL_SERVER_USER as string,
					pass: process.env.EMAIL_SERVER_PASSWORD as string,
				},
			},
			from: process.env.EMAIL_FROM as string,
			sendVerificationRequest: async ({ identifier, url, provider }) => {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'**************************************************************************\n\n\n',
					)
					console.log('EmailProvider\n')
					console.log(`${identifier}\n`)
					console.log(url)
					console.log(
						'\n\n\n**************************************************************************',
					)
				}

				const transport = createTransport(provider.server)
				const result = await transport.sendMail({
					to: identifier,
					from: provider.from,
					subject: `Sign in to fun-todo`,
					text: text(url),
					html: html(url),
				})
				const failed = result.rejected.concat(result.pending).filter(Boolean)
				if (failed.length) {
					throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
				}
			},
		}),
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID as string,
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
		}),
	],
	events: {
		async createUser({ user }) {
			await prisma.project.create({
				data: {
					inbox: user.id,
					name: 'Inbox',
					members: {
						create: {
							userId: user.id,
							role: 'OWNER',
						},
					},
				},
			})
		},
	},
	callbacks: {
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
			}

			return session
		},
		async jwt({ token, user }) {
			const dbUser = await prisma.user.findFirst({
				where: {
					email: token.email,
				},
			})

			if (!dbUser) {
				if (user) {
					token.id = user?.id
				}
				return token
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			}
		},
	},
}

export async function getRequiredUser() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		throw new Error("'Unauthorized'")
	}

	return session.user
}

function html(url: string) {
	const color = {
		background: '#f9f9f9',
		text: '#444',
		mainBackground: '#fff',
		buttonBackground: '#346df1',
		buttonBorder: '#346df1',
		buttonText: '#fff',
	}

	return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>fun-todo</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`
}

function text(url: string) {
	return `Sign in to fun-todo\n${url}\n\n`
}
