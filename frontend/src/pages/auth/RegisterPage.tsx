import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, User, School, Send, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register, clearError } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Logo } from '@/components/common/Logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
    department: '',
    telegramUsername: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validate()) return;

    try {
      const payload: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      if (formData.universityId.trim()) payload.universityId = formData.universityId.trim();
      if (formData.department.trim()) payload.department = formData.department.trim();
      if (formData.telegramUsername.trim()) payload.telegramUsername = formData.telegramUsername.trim().replace(/^@/, '');

      const resultAction = await dispatch(register(payload));
      if (register.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Welcome to CSEC-ASTU BMS.');
        navigate('/dashboard', { replace: true });
      } else {
        const msg = (resultAction.payload as string) || 'Registration failed. Please check your inputs.';
        toast.error(msg);
      }
    } catch {
      toast.error('An unexpected connection error occurred.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="mb-6 w-full max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-lg border-[var(--border)] shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-sm text-[var(--muted-foreground)]">
            Join CSEC-ASTU bootcamps and embark on specialized engineering tracks
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FormField
              label="Full Name"
              required
              error={validationErrors.fullName}
              htmlFor="fullName"
            >
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Abebe Kebede"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </FormField>

            <FormField
              label="Email Address"
              required
              error={validationErrors.email}
              htmlFor="email"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@astu.edu.et"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Password"
                required
                error={validationErrors.password}
                htmlFor="password"
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9 pr-9"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <FormField
                label="Confirm Password"
                required
                error={validationErrors.confirmPassword}
                htmlFor="confirmPassword"
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-9 pr-9"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  ASTU Student Details (Optional)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="University ID" htmlFor="universityId">
                  <div className="relative">
                    <School className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    <Input
                      id="universityId"
                      name="universityId"
                      placeholder="UGR/1234/15"
                      value={formData.universityId}
                      onChange={handleChange}
                      className="pl-8 text-xs h-9"
                      disabled={loading}
                    />
                  </div>
                </FormField>

                <FormField label="Department" htmlFor="department">
                  <Input
                    id="department"
                    name="department"
                    placeholder="e.g. CSE"
                    value={formData.department}
                    onChange={handleChange}
                    className="text-xs h-9"
                    disabled={loading}
                  />
                </FormField>

                <FormField label="Telegram Handle" htmlFor="telegramUsername">
                  <div className="relative">
                    <Send className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    <Input
                      id="telegramUsername"
                      name="telegramUsername"
                      placeholder="@username"
                      value={formData.telegramUsername}
                      onChange={handleChange}
                      className="pl-8 text-xs h-9"
                      disabled={loading}
                    />
                  </div>
                </FormField>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-[var(--border)] pt-4 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
