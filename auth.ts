import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [authorize] Starting credentials authorization');
          console.log('🔐 [authorize] Email:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ [authorize] Missing credentials');
            return null // Return null instead of throwing for better error handling
          }

          console.log('🔐 [authorize] Connecting to database...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          console.log('🔐 [authorize] User found:', user ? 'yes' : 'no');
          if (user) {
            console.log('🔐 [authorize] User details:', {
              id: user.id,
              email: user.email,
              hasPassword: !!user.password,
              active: user.active,
              role: user.role
            });
          }

          if (!user || !user.password) {
            console.log('❌ [authorize] User not found or no password');
            return null
          }

          console.log('🔐 [authorize] Comparing passwords...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          console.log('🔐 [authorize] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ [authorize] Invalid password');
            return null
          }

          console.log('🔐 [authorize] User active:', user.active);

          if (!user.active) {
            console.log('❌ [authorize] User not active');
            return null
          }

          console.log('✅ [authorize] Authorization successful, returning user');

          // Return user object with all required fields
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            active: user.active,
          }
        } catch (error) {
          console.error('❌ [authorize] Error during authorization:', error);
          return null // Always return null on error
        }
      },
    }),
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
      console.log('🔐 [signIn] Provider:', account?.provider);

      if (!user.email) {
        console.log('❌ [signIn] No email provided, rejecting sign in');
        return false;
      }

      // For Credentials provider, user is already validated in authorize()
      if (account?.provider === 'credentials') {
        console.log('✅ [signIn] Credentials login successful');
        return true;
      }

      // For Google OAuth, upsert user in database
      if (account?.provider === 'google') {
        try {
          console.log('🔐 [signIn] Google OAuth - Upserting user via API...');

          // Use absolute URL construction for Vercel
          const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:6699';

          const response = await fetch(`${baseUrl}/api/auth/user`, {
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
      }

      return false;
    },

    async jwt({ token, account, user, trigger }) {
      console.log('🔑 [jwt] Starting jwt callback');
      console.log('🔑 [jwt] Trigger:', trigger);
      console.log('🔑 [jwt] User object:', user);
      console.log('🔑 [jwt] Token email:', token.email);

      // Save access token when user logs in
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
      // This handles edge cases where token doesn't have user data
      if (!token.userId && token.email) {
        console.log('🔑 [jwt] No userId in token, fetching from database by email:', token.email);
        try {
          // Use absolute URL construction for Vercel
          const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:6699';

          const response = await fetch(`${baseUrl}/api/auth/user?email=${encodeURIComponent(token.email)}`);
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

      // Add access token, role and user ID to session
      if (session.user) {
        session.accessToken = token.accessToken as string
        session.user.id = token.userId as string
        session.user.role = token.role as Role
        session.user.active = token.active as boolean
      }

      console.log('✅ [session] Final session data:', {
        userId: session.user?.id,
        email: session.user?.email,
        role: session.user?.role,
        active: session.user?.active,
      });

      return session
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Add error page for better UX
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
})
