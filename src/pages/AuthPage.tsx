import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import christLogo from '@/assets/christ-university-logo.png';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const highlights = [
  {
    icon: TrendingUp,
    title: 'Real-time placement tracking',
    description: 'Follow every application from applied to offer in one live dashboard.',
  },
  {
    icon: Building2,
    title: 'Verified recruiting partners',
    description: 'Explore roles from companies actively hiring on campus this season.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure university sign-in',
    description: 'Access is restricted to official Christ University email accounts.',
  },
];

const stats = [
  { value: '1,200+', label: 'Students' },
  { value: '150+', label: 'Companies' },
  { value: '94%', label: 'Placed' },
];

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      if (user.role === 'placement_officer') {
        navigate('/officer/dashboard', { replace: true });
      } else if (user.role === 'student_representative') {
        navigate('/representative/dashboard', { replace: true });
      } else {
        if (!user.registerNumber || !user.phone || !user.department || !user.section || !user.gender || !user.gpa) {
          navigate('/student/profile-setup', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      passwordSchema.parse(loginData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginData.email.trim(), loginData.password);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome Back! 👋',
        description: 'Successfully logged in.',
      });
    }

    setIsLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      const { error } = await signInWithGoogle(tokenResponse.access_token);
      if (error) {
        toast({
          title: 'Google Sign-in Failed',
          description: error.message || 'Please use your university Google account.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Welcome Back! 👋', description: 'Signed in with Google.' });
      }
      setGoogleLoading(false);
    },
    onError: () => {
      toast({
        title: 'Google Sign-in Failed',
        description: 'Could not complete Google sign-in. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (authLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const busy = isLoading || googleLoading;

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* ─── Left brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white gradient-hero">
        {/* Decorative layers */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-success/25 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white p-2 shadow-lg">
            <img src={christLogo} alt="Christ University" className="h-11 w-auto" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-lg font-bold">Christ University</p>
            <p className="text-xs text-white/70">Placement Portal</p>
          </div>
        </div>

        {/* Headline + highlights */}
        <div className="relative z-10 max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5" />
            Campus Recruitment, reimagined
          </div>
          <h1 className="font-heading text-4xl font-extrabold leading-tight">
            Your gateway to the right career.
          </h1>
          <p className="mt-4 text-white/75">
            One platform for students, placement officers, and recruiters to manage
            drives, applications, and offers — end to end.
          </p>

          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/65">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/15 backdrop-blur">
              <p className="font-heading text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ─── Right login panel ────────────────────────────────────────── */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="rounded-2xl bg-white p-2 shadow-md ring-1 ring-border/50">
              <img src={christLogo} alt="Christ University" className="h-12 w-auto" />
            </div>
            <p className="font-heading text-sm font-semibold text-muted-foreground">
              Christ University Placement Portal
            </p>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-muted-foreground">
              Sign in to continue to your placement dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="font-semibold">University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="yourname@mca.christuniversity.in"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="pl-10 pr-11 h-12 rounded-xl"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-base" disabled={busy}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              or continue with
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={() => googleLogin()}
            disabled={busy}
            className="w-full h-12 rounded-xl text-base font-semibold gap-3 border-border/80 bg-background hover:bg-muted/60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Sign in with Google
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Only official Christ University accounts can access this portal.
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to the university's placement policies.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
