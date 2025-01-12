import type { Session, User } from 'better-auth';
import { getAuth } from './lib/auth';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware<{
  Variables: {
    session: Session;
    user: User;
  };
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  try {
    const env = c.env;
    const auth = getAuth(env);

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({}, 401);
    }

    c.set('session', session.session);
    c.set('user', session.user);
    await next();
  } catch {
    return c.json({}, 500);
  }
});
