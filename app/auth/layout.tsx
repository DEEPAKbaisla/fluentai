import Link from "next/link";
import { Mic } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-indigo-500/5 p-4">
      {/* Mobile logo */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">FluentAI</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
