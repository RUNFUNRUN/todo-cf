import { Hono } from 'hono';
import { todos } from './todos';
import { getAuth } from './lib/auth';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use('*', async (c, next) => {
    const corsMiddlewareHandler = cors({
      origin: c.env.CORS_ORIGIN.split(','),
      credentials: true,
    });
    return corsMiddlewareHandler(c, next);
  })
  .on(['GET', 'POST'], '/auth/**', async (c) => {
    const env = c.env;
    const auth = getAuth(env);
    return auth.handler(c.req.raw);
  })
  .get('/', (c) => {
    return c.text('Hello Hono!');
  })
  .route('todos', todos);

export default app;

export type AppType = typeof app;
