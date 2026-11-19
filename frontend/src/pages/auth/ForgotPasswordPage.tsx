import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Logo } from '@/components/common/Logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setValidationError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(trimmed);
      setSubmitted(true);
      toast.success('Password reset instructions recorded.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request password reset. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="mb-6 w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>

      <Card className="w-full max-w-md border-[var(--border)] shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-sm text-[var(--muted-foreground)]">
            {submitted
              ? 'Check your email for next steps'
              : 'Enter your registered email to request a password reset link'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  Reset Request Dispatched
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  If an account exists with <span className="font-semibold text-[var(--foreground)]">{email}</span>,
                  password reset instructions have been recorded or forwarded to your division lead/administrator.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                >
                  Try another email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <FormField
                label="Registered Email"
                required
                error={validationError || undefined}
                htmlFor="email"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="student@astu.edu.et"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            Remember your credentials? Return to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
