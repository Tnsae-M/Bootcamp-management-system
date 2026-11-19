import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Code2,
  Terminal,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Layers,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAppSelector } from '@/app/hooks';
import { getDashboardRoot } from '@/config/navigation';
import landingImg from '@/assets/images/landing.jpg';

export default function LandingPage() {
  const { isAuthenticated, activeRole } = useAppSelector((s) => s.auth);

  const dashboardPath = isAuthenticated ? getDashboardRoot(activeRole) : '/login';

  const tracks = [
    {
      title: 'Competitive Programming',
      icon: Terminal,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description:
        'Master algorithms, complex data structures, and ICPC/codeforces problem-solving strategies through intense weekly drills.',
      skills: ['Data Structures', 'Algorithms', 'Graph Theory', 'Dynamic Programming'],
    },
    {
      title: 'Cybersecurity & Defense',
      icon: Shield,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      description:
        'Hands-on network security, web application pentesting, binary exploitation, digital forensics, and CTF challenges.',
      skills: ['Web Pentesting', 'Network Security', 'Cryptography', 'Reverse Engineering'],
    },
    {
      title: 'Software Engineering & Web',
      icon: Code2,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description:
        'End-to-end fullstack development, cloud native deployments, system architecture, database design, and production workflows.',
      skills: ['React & Next.js', 'Node.js & Go', 'PostgreSQL', 'Docker & DevOps'],
    },
    {
      title: 'Applied AI & Data Science',
      icon: Cpu,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description:
        'Foundational machine learning, deep neural networks, computer vision, natural language processing, and model evaluation.',
      skills: ['PyTorch', 'Model Fine-tuning', 'Data Pipelines', 'Prompt Engineering'],
    },
  ];

  const highlights = [
    {
      title: 'Cohort & Session Tracking',
      description: 'Dynamic attendance PIN validation, session records, and real-time student engagement logging.',
      icon: Layers,
    },
    {
      title: 'Multi-Signal Induction',
      description: 'Comprehensive scoring aggregating attendance integrity, task rigor, and peer review metrics.',
      icon: Award,
    },
    {
      title: 'Division-Scoped Workspaces',
      description: 'Tailored portals for Division Admins, Instructors, Students, and Prospective Applicants.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#tracks" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Specialization Tracks
            </a>
            <a href="#architecture" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Core Capabilities
            </a>
            <a href="#about" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              About CSEC
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link to={dashboardPath}>
                  Enter Portal ({activeRole ? activeRole.replace(/_/g, ' ') : 'Dashboard'})
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-xs mb-6">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Next-Gen Engineering Bootcamps</span>
                <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                <span className="text-[var(--muted-foreground)]">CSEC-ASTU</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[var(--foreground)]">
                Structured Excellence. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  Data-Driven Induction.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-[var(--muted-foreground)] max-w-2xl">
                The centralized bootcamp management platform engineered for Computer Science & Engineering
                Community at ASTU. Organize multi-track bootcamps, verify attendance with dynamic codes,
                assess submissions, and compute induction status with transparent rigor.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild className="h-12 px-6">
                    <Link to={dashboardPath}>
                      Go to Your Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="h-12 px-6">
                      <Link to="/register">
                        Join an Active Bootcamp
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-12 px-6">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-8">
                <div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">4+</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Specialized Divisions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">100%</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Peer & Task Auditing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">ASTU</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Premier Student Tech Hub</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  <img
                    src={landingImg}
                    alt="CSEC-ASTU Bootcamp Community"
                    className="h-80 w-full object-cover sm:h-96"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--foreground)]">Active Induction Engine</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">Evaluating attendance, grading, and peer capstones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" className="border-t border-[var(--border)] bg-[var(--muted)]/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Curriculum Tracks
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Specialized Divisions Tailored for Real-World Competence
            </p>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Every division at CSEC-ASTU runs high-intensity curricula designed to transition aspiring students
              into industry-ready problem solvers and researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.title}
                  className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--primary)]/50 hover:shadow-md"
                >
                  <div>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg border ${track.color} mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--card-foreground)] mb-2">
                      {track.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
                      {track.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)]">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section id="architecture" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-[var(--border)] bg-[var(--card)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo size="sm" />
            <p className="text-xs text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} CSEC-ASTU (Computer Science and Engineering Club). All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
              <Link to="/login" className="hover:text-[var(--foreground)] transition-colors">
                Sign In
              </Link>
              <span>•</span>
              <Link to="/register" className="hover:text-[var(--foreground)] transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
