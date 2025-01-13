import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: new URL('/auth', import.meta.env.VITE_BETTER_AUTH_URL!).toString(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
