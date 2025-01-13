import { AppType, schema } from '@/backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useId, useState } from 'react';

const client = hc<AppType>(import.meta.env.VITE_BETTER_AUTH_URL, {
  init: {
    credentials: 'include',
  },
});

const newTodoSchema = z.object({
  name: z.string().min(1).max(255),
});

const EmptyRow = () => (
  <TableRow>
    <TableCell />
    <TableCell />
    <TableCell />
  </TableRow>
);

const NewTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const newTodoId = useId();

  const form = useForm<z.infer<typeof newTodoSchema>>({
    resolver: zodResolver(newTodoSchema),
    defaultValues: {
      name: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (newTodo: z.infer<typeof newTodoSchema>) => {
    try {
      await client.todos.$post({ json: newTodo });
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      form.reset();
    } catch {
      toast({ title: 'An error occurred.', variant: 'destructive' });
    }
  };

  return (
    <TableRow>
      <TableCell />
      <TableCell>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id={newTodoId}>
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} className='md:text-lg' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </TableCell>
      <TableCell className='block'>
        <Button
          size='icon'
          type='submit'
          form={newTodoId}
          className='mt-0 mb-auto'
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className='animate-spin' /> : <Plus />}
        </Button>
      </TableCell>
    </TableRow>
  );
};

const Todo = ({
  todo,
}: Readonly<{ todo: typeof schema.todo.$inferSelect }>) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [checked, setChecked] = useState(todo.completed);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = async () => {
    const currentChecked = checked;
    try {
      if (todo.completed) {
        setChecked(false);
        await client.todos[':id'].incomplete.$patch({ param: { id: todo.id } });
      } else {
        setChecked(true);
        await client.todos[':id'].complete.$patch({ param: { id: todo.id } });
      }
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    } catch {
      setChecked(currentChecked);
      toast({ title: 'An error occurred.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await client.todos[':id'].$delete({ param: { id: todo.id } });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    } catch {
      setIsDeleting(false);
      toast({ title: 'An error occurred.', variant: 'destructive' });
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Checkbox
            className='w-6 h-6'
            checked={checked}
            onClick={handleComplete}
          />
        </TableCell>
        <TableCell>
          <p className={cn('text-left md:text-lg', checked && 'line-through')}>
            {todo.name}
          </p>
        </TableCell>
        <TableCell>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className='animate-spin' /> : <Trash2 />}
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
};

export const Todos = () => {
  const todos = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await client.todos.$get({ query: {} });
      return (await res.json()).todos;
    },
  });

  if (todos.status === 'error') {
    return <p>An error occurred.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[52px]' />
          <TableHead className='w-[400px]' />
          <TableHead className='w-[52px]' />
        </TableRow>
      </TableHeader>
      <TableBody>
        <NewTodo />
        <EmptyRow />
        {todos.data &&
          todos.data.map((todo) => (
            <Todo
              todo={{
                ...todo,
                createdAt: new Date(todo.createdAt),
                updatedAt: new Date(todo.updatedAt),
              }}
              key={todo.id}
            />
          ))}
      </TableBody>
    </Table>
  );
};
