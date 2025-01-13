import { Hono } from 'hono';
import { authMiddleware } from './middleware';
import { getDB } from './lib/db';
import { and, eq } from 'drizzle-orm';
import { schema } from './lib/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const todos = new Hono<{ Bindings: CloudflareBindings }>()
  .use(authMiddleware)
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        status: z.enum(['completed', 'incompleted']).optional(),
      }),
    ),
    async (c) => {
      try {
        const db = getDB(c.env.DB);
        const user = c.var.user;
        const status = c.req.valid('query').status;
        const completed =
          status === 'completed'
            ? true
            : status === 'incompleted'
              ? false
              : undefined;

        const todos = await db.query.todo.findMany({
          where: (todo) =>
            and(
              eq(todo.userId, user.id),
              completed !== undefined
                ? eq(todo.completed, completed)
                : undefined,
            ),
          orderBy: (todo, { desc }) => [todo.completed, desc(todo.createdAt)],
        });

        return c.json({ todos }, 200);
      } catch {
        return c.json({}, 500);
      }
    },
  )
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        name: z.string().min(1).max(255),
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
        where: (todo) => and(eq(todo.id, todoId), eq(todo.userId, user.id)),
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
        where: (todo) => and(eq(todo.id, todoId), eq(todo.userId, user.id)),
      });

      if (!todo) {
        return c.body(null, 404);
      }

      await db
        .delete(schema.todo)
        .where(
          and(eq(schema.todo.userId, user.id), eq(schema.todo.id, todoId)),
        );

      return c.body(null, 204);
    } catch {
      return c.body(null, 500);
    }
  })
  .patch('/:id/complete', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: (todo) => and(eq(todo.id, todoId), eq(todo.userId, user.id)),
      });

      if (!todo) {
        return c.status(404);
      }
      if (todo.completed) {
        return c.json({ todo }, 200);
      }

      const newTodo = await db
        .update(schema.todo)
        .set({ completed: true })
        .where(
          and(eq(schema.todo.userId, user.id), eq(schema.todo.id, todo.id)),
        )
        .returning();

      return c.json({ todo: newTodo[0] }, 200);
    } catch (e) {
      console.error(e);
      return c.json({}, 500);
    }
  })
  .patch('/:id/incomplete', async (c) => {
    try {
      const db = getDB(c.env.DB);
      const user = c.var.user;
      const todoId = c.req.param('id');

      const todo = await db.query.todo.findFirst({
        where: (todo) => and(eq(todo.id, todoId), eq(todo.userId, user.id)),
      });

      if (!todo) {
        return c.status(404);
      }
      if (!todo.completed) {
        return c.json({ todo }, 200);
      }

      const newTodo = await db
        .update(schema.todo)
        .set({ completed: false })
        .where(
          and(eq(schema.todo.userId, user.id), eq(schema.todo.id, todo.id)),
        )
        .returning();

      return c.json({ todo: newTodo[0] }, 200);
    } catch {
      return c.json({}, 500);
    }
  });
