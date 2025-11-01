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
        console.log('🔐 [authorize] === START ===');
        console.log('🔐 [authorize] Credentials received:', {
          hasEmail: !!credentials?.email,
          hasPassword: !!credentials?.password,
          email: credentials?.email,
        });

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ [authorize] Missing credentials, returning null');
            return null
          }

          console.log('🔐 [authorize] Querying database for user...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user) {
            console.log('❌ [authorize] User not found in database, returning null');
            return null
          }

          console.log('✅ [authorize] User found:', {
            id: user.id,
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password?.length || 0,
            active: user.active,
            role: user.role
          });

          if (!user.password) {
            console.log('❌ [authorize] User has no password set, returning null');
            return null
          }

          console.log('🔐 [authorize] Comparing passwords with bcrypt...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          console.log('🔐 [authorize] Password comparison result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ [authorize] Password mismatch, returning null');
            return null
          }

          if (!user.active) {
            console.log('❌ [authorize] User not active, returning null');
            return null
          }

          // Return user object with role and active - these will be added to token in jwt callback
          const userResponse = {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.image,
            role: user.role,
            active: user.active,
          };

          console.log('✅ [authorize] SUCCESS - Returning user:', JSON.stringify(userResponse, null, 2));
          console.log('✅ [authorize] User email check:', {
            hasEmail: !!userResponse.email,
            emailValue: userResponse.email,
            emailType: typeof userResponse.email
          });
          console.log('🔐 [authorize] === END SUCCESS ===');
          return userResponse;

        } catch (error) {
          console.error('❌ [authorize] === EXCEPTION ===');
          console.error('❌ [authorize] Error type:', typeof error);
          console.error('❌ [authorize] Error name:', error instanceof Error ? error.name : 'Unknown');
          console.error('❌ [authorize] Error message:', error instanceof Error ? error.message : String(error));
          console.error('❌ [authorize] Error stack:', error instanceof Error ? error.stack : 'No stack');
          console.error('❌ [authorize] Full error object:', JSON.stringify(error, null, 2));
          console.error('❌ [authorize] === END EXCEPTION ===');
          return null
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
      console.log('🔐 [signIn] === SIGNIN CALLBACK START ===');
      console.log('🔐 [signIn] User:', JSON.stringify(user, null, 2));
      console.log('🔐 [signIn] Account provider:', account?.provider);
      console.log('🔐 [signIn] Account type:', account?.type);

      // CRITICAL FIX: Check provider FIRST, before any other validation
      // For Credentials provider, user is already validated in authorize()
      // Return true immediately to avoid any additional validation that might fail
      if (account?.provider === 'credentials') {
        console.log('✅ [signIn] Credentials provider - ALLOWING (validated in authorize)');
        console.log('🔐 [signIn] === SIGNIN CALLBACK END SUCCESS ===');
        return true;
      }

      // For OAuth providers (Google, etc), validate email exists
      if (!user.email) {
        console.log('❌ [signIn] REJECTING - No email provided (OAuth provider)');
        return false;
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

      console.log('❌ [signIn] Unknown provider, rejecting');
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
          active: (user as any).active,
        });
        token.userId = user.id;
        token.role = (user as any).role;
        token.active = (user as any).active;
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
