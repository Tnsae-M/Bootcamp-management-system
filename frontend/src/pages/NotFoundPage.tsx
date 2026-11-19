import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <div className="mb-6">
        <Logo size="lg" />
      </div>

      <div className="rounded-full bg-[var(--muted)] p-4 text-[var(--muted-foreground)] mb-6">
        <HelpCircle className="h-12 w-12 text-[var(--primary)]" />
      </div>

      <h1 className="text-6xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-7xl">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-sm text-[var(--muted-foreground)] leading-relaxed">
        The requested path does not exist, may have been relocated, or requires higher role authorization.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
