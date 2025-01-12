import { Hono } from 'hono';
import { authMiddleware } from './middleware';
import { getDB } from './lib/db';
import { and, eq } from 'drizzle-orm';
import { schema } from './lib/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const todos = new Hono<{ Bindings: CloudflareBindings }>()
  .use(authMiddleware)
  .get('/', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;

      const todos = await db.query.todo.findMany({
        where: eq(schema.user.id, user.id),
      });

      return c.json({ todos }, 200);
    } catch {
      return c.json({}, 500);
    }
  })
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        name: z.string(),
      }),
    ),
    async (c) => {
      try {
        const db = getDB(c.env.DB);
        const user = c.var.user;
        const reqBody = c.req.valid('json');

        const todo = await db
          .insert(schema.todo)
          .values({ name: reqBody.name, userId: user.id })
          .returning();

        return c.json({ todo }, 201);
      } catch {
        return c.json({}, 500);
      }
    },
  )
  .get('/:id', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: and(eq(schema.todo.id, todoId), eq(schema.user.id, user.id)),
      });

      if (!todo) {
        return c.json({}, 404);
      }

      return c.json({ todo }, 200);
    } catch {
      return c.json({}, 500);
    }
  })
  .delete('/:id', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: and(eq(schema.todo.id, todoId), eq(schema.user.id, user.id)),
      });

      if (!todo) {
        return c.status(404);
      }

      await db
        .update(schema.todo)
        .set({ completed: true })
        .where(and(eq(schema.user.id, user.id), eq(schema.todo.id, todoId)));

      return c.status(204);
    } catch {
      return c.status(500);
    }
  })
  .patch('/:id/complete', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: and(eq(schema.todo.id, todoId), eq(schema.user.id, user.id)),
      });

      if (!todo) {
        return c.status(404);
      }

      const newTodo = await db
        .update(schema.todo)
        .set({ completed: true })
        .where(eq(schema.todo, todo))
        .returning();

      return c.json({ todo: newTodo[0] }, 200);
    } catch {
      return c.json({}, 500);
    }
  })
  .patch('/:id/incomplete', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: and(eq(schema.todo.id, todoId), eq(schema.user.id, user.id)),
      });

      const newTodo = await db
        .update(schema.todo)
        .set({ completed: false })
        .where(eq(schema.todo, todo))
        .returning();

      return c.json({ todo: newTodo[0] }, 200);
    } catch {
      return c.json({}, 500);
    }
  });
