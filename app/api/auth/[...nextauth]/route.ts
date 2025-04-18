import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import { JWT } from "next-auth/jwt"

interface TwitterProfile {
  data: {
    id: string
    name: string
    username: string
    profile_image_url: string
  }
}

export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      profile(profile: TwitterProfile) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          username: profile.data.username,
          image: profile.data.profile_image_url,
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, profile }: { 
      token: JWT, 
      user: any, 
      profile?: any,
      account?: any 
    }) {
      if (profile?.data) {
        token.id = profile.data.id
        token.username = profile.data.username
      }
      return token
    },
    async session({ session, token }: { session: any, token: JWT }) {
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }