import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/spreadsheets",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 [signIn] Starting signIn callback');
      console.log('🔐 [signIn] User email:', user.email);

      if (!user.email) {
        console.log('❌ [signIn] No email provided, rejecting sign in');
        return false;
      }

      try {
        console.log('🔐 [signIn] Upserting user via API...');

        // Call our Node.js API route to handle Prisma operations
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:6699'}/api/auth/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
          }),
        });

        if (!response.ok) {
          console.error('❌ [signIn] API call failed:', response.status);
          return false;
        }

        const dbUser = await response.json();

        console.log('✅ [signIn] User in database:', {
          id: dbUser.id,
          role: dbUser.role,
          active: dbUser.active,
        });

        // Store user ID and role for later use
        user.id = dbUser.id;
        (user as any).role = dbUser.role;
        (user as any).active = dbUser.active;

        console.log('🔐 [signIn] Active status:', dbUser.active);
        console.log('🔐 [signIn] Returning:', dbUser.active);

        return dbUser.active; // Only allow login if user is active
      } catch (error) {
        console.error('❌ [signIn] Error during sign in:', error);
        return false;
      }
    },
    async jwt({ token, account, user, trigger }) {
      console.log('🔑 [jwt] Starting jwt callback');
      console.log('🔑 [jwt] Trigger:', trigger);
      console.log('🔑 [jwt] User object:', user);
      console.log('🔑 [jwt] Token email:', token.email);

      // Guardar o access token quando o utilizador faz login
      if (account) {
        console.log('🔑 [jwt] Account present, saving tokens');
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      // Add user role and ID to token on first sign in
      if (user) {
        console.log('🔑 [jwt] User present (first sign in):', {
          id: user.id,
          email: user.email,
          role: (user as any).role,
        });
        token.userId = user.id;
        token.role = (user as any).role;
        token.active = (user as any).active;
      }

      // If we don't have userId yet but we have email, fetch from database via API
      if (!token.userId && token.email) {
        console.log('🔑 [jwt] No userId in token, fetching from database by email:', token.email);
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:6699'}/api/auth/user?email=${encodeURIComponent(token.email)}`);
          if (response.ok) {
            const dbUser = await response.json();
            console.log('✅ [jwt] User found in database:', dbUser);
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.active = dbUser.active;
          } else {
            console.log('⚠️ [jwt] User not found in database by email');
          }
        } catch (error) {
          console.error('❌ [jwt] Error fetching user by email:', error);
        }
      }

      console.log('🔑 [jwt] Final token data:', {
        userId: token.userId,
        email: token.email,
        role: token.role,
        active: token.active,
      });

      return token
    },
    async session({ session, token }) {
      console.log('🎫 [session] Starting session callback');
      console.log('🎫 [session] Token data:', {
        userId: token.userId,
        role: token.role,
        active: token.active,
      });

      // Adicionar access token, role e user ID à sessão
      session.accessToken = token.accessToken as string
      session.user.id = token.userId as string
      session.user.role = token.role as Role
      session.user.active = token.active as boolean

      console.log('✅ [session] Final session data:', {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        active: session.user.active,
      });

      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})
