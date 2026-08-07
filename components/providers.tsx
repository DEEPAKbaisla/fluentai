"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
