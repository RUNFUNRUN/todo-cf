import { Layout } from './layout';
import { SignIn } from './components/sign-in';
import { SignOut } from './components/sign-out';
import { Todos } from './components/todos';
import { useSession } from './lib/auth-client';

export const App = () => {
  const { data: session, isPending, error } = useSession();

  if (error) return <h1 className='text-center'>An error occurred.</h1>;

  return (
    <Layout>
      <div className='space-y-4 mx-auto my-12 text-center'>
        <h1 className='text-2xl font-bold'>TODO App</h1>
        <p>
          <a
            href='https://github.com/RUNFUNRUN/todo-cf'
            className='text-xl underline'
          >
            https://github.com/RUNFUNRUN/todo-cf
          </a>
        </p>
        {isPending && <p>Loading...</p>}
        <div>{!isPending && (session ? <SignOut /> : <SignIn />)}</div>
        {session && <Todos />}
      </div>
    </Layout>
  );
};
