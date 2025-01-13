import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

export const SignIn = () => {
  return (
    <Button
      onClick={async () => {
        await signIn.social({
          provider: 'github',
        });
      }}
    >
      SignIn with GitHub
    </Button>
  );
};
