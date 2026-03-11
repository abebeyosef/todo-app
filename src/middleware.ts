export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Protect every route except:
     * - /login            — the sign-in page itself
     * - /api/auth/**      — NextAuth's own sign-in/callback routes
     * - /_next/**         — Next.js internals (JS, CSS, images)
     * - /favicon.ico      — browser tab icon
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
