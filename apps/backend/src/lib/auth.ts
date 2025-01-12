import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDB } from './db';

export const getAuth = (env: CloudflareBindings) => {
  return betterAuth({
    baseURL: new URL('/auth', env.BETTER_AUTH_URL!).toString(),
    database: drizzleAdapter(getDB(env.DB), {
      provider: 'sqlite',
    }),
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    trustedOrigins: env.CORS_ORIGIN.split(','),
  });
};
