import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

export const SignOut = () => {
  return (
    <Button
      onClick={async () => {
        await signOut();
      }}
    >
      SignOut
    </Button>
  );
};
