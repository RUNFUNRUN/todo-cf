import { Hono } from 'hono';
import { todos } from './todos';
import { getAuth } from './lib/auth';

const app = new Hono<{ Bindings: CloudflareBindings }>()
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
