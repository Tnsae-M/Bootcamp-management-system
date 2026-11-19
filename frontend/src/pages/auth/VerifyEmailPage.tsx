import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Logo } from '@/components/common/Logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend form state in case of failure
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function runVerification() {
      if (!token) {
        if (mounted) {
          setVerifying(false);
          setErrorMessage('No verification token provided in URL.');
        }
        return;
      }

      try {
        await authService.verifyEmail(token);
        if (mounted) {
          setSuccess(true);
          setVerifying(false);
          toast.success('Email successfully verified!');
        }
      } catch (err: any) {
        if (mounted) {
          setVerifying(false);
          const msg = err.response?.data?.message || 'Verification link is invalid or has expired.';
          setErrorMessage(msg);
        }
      }
    }

    runVerification();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your registered email');
      return;
    }

    setResending(true);
    try {
      await authService.resendVerification(resendEmail.trim());
      setResendSuccess(true);
      toast.success('New verification link dispatched to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="mb-6 w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-md border-[var(--border)] shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
          <CardDescription className="text-sm text-[var(--muted-foreground)]">
            Validating account credentials with CSEC-ASTU identity registry
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verifying ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
              <p className="text-sm text-[var(--muted-foreground)]">
                Verifying your token with BMS security services...
              </p>
            </div>
          ) : success ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  Account Verified!
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Your email address has been confirmed. You now possess active access to the CSEC-ASTU platform.
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate('/login', { replace: true })}
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Verification Unsuccessful</h4>
                  <p className="text-xs leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              {resendSuccess ? (
                <div className="rounded-lg bg-[var(--muted)] p-4 text-center text-xs text-[var(--muted-foreground)]">
                  A fresh verification link has been sent to{' '}
                  <span className="font-semibold text-[var(--foreground)]">{resendEmail}</span>.
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    Request a replacement verification email:
                  </p>
                  <FormField label="Email" htmlFor="resendEmail">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                      <Input
                        id="resendEmail"
                        type="email"
                        placeholder="student@astu.edu.et"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="pl-9"
                        disabled={resending}
                      />
                    </div>
                  </FormField>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
