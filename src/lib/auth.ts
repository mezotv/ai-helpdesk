import { betterAuth } from "better-auth"
import { organization } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./prisma"

export const auth = betterAuth({
    plugins: [ 
        organization({
            schema: {
                organization: {
                    additionalFields: {
                        website: {
                            type: "string",
                            required: false,
                            input: true,
                        },
                        acceptedSenders: {
                            type: "string[]",
                            required: false,
                            defaultValue: [],
                            input: true,
                        },
                    },
                },
            },
        }) 
    ],
    experimental: {
        joins: true,
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const orgSlug = `personal-${user.id.slice(0, 8)}`
                    
                    const organization = await prisma.organization.create({
                        data: {
                            id: crypto.randomUUID(),
                            name: "Personal",
                            slug: orgSlug,
                            createdAt: new Date(),
                        },
                    })

                    await prisma.member.create({
                        data: {
                            id: crypto.randomUUID(),
                            organizationId: organization.id,
                            userId: user.id,
                            role: "owner",
                            createdAt: new Date(),
                        },
                    })
                },
            },
        },
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
})