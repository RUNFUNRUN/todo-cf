import { cn } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

export const Layout = ({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) => {
  return (
    <main className={cn('flex flex-col min-h-dvh', className)}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </main>
  );
};
