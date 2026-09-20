import type { NextAuthConfig } from "next-auth";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/offline"];

export const authConfig = {
  // Trust the incoming Host header — needed because Vercel (and `next start`
  // locally) don't set NEXTAUTH_URL, and Auth.js refuses same-origin API
  // calls like /api/auth/session in production without this.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

      if (isPublicRoute) {
        if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
