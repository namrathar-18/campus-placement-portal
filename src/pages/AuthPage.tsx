import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import christLogo from '@/assets/christ-university-logo.png';
import { z } from 'zod';
import api from '@/lib/api';

const emailSchema = z.string().trim().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // ── Google Login (for the Login tab) ─────────────────────────────────────
  const googleLoginForLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Verify domain before hitting backend
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { email: googleEmail } = await infoRes.json();
        const validDomains = ['@mca.christuniversity.in', '@mscaiml.christuniversity.in'];
        if (!googleEmail || !validDomains.some(d => googleEmail.toLowerCase().endsWith(d))) {
          toast({
            title: 'Invalid Email Domain',
            description: 'Only @mca.christuniversity.in and @mscaiml.christuniversity.in accounts are allowed.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        const response = await api.post('/auth/google', { accessToken: tokenResponse.access_token });
        const userData = response.data?.data || response.data;
        if (userData?.token) {
          localStorage.setItem('token', userData.token);
          toast({ title: 'Welcome! 👋', description: 'Signed in with Google successfully.' });
          window.location.reload();
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'Google sign-in failed.';
        toast({ title: 'Google Sign-In Failed', description: msg, variant: 'destructive' });
      }
      setIsLoading(false);
    },
    onError: () => toast({ title: 'Google Sign-In Failed', description: 'Could not open Google sign-in.', variant: 'destructive' }),
  });


  useEffect(() => {
    // Only redirect if authenticated AND not currently loading
    if (isAuthenticated && user && !authLoading) {
      if (user.role === 'placement_officer') {
        navigate('/officer/dashboard', { replace: true });
      } else if (user.role === 'student_representative') {
        navigate('/representative/dashboard', { replace: true });
      } else {
        // Check if student has completed profile setup
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

  const handleForgotPassword = async () => {
    if (resetStep === 'email') {
      setIsLoading(true);
      try {
        emailSchema.parse(forgotPasswordEmail);
        const response = await api.post('/auth/forgot-password', { email: forgotPasswordEmail });
        
        // Show the code in development mode
        let description = 'Check your email for the password reset code.';
        if (response.data?.devCode) {
          description = `Your reset code is: ${response.data.devCode}`;
        }
        
        toast({
          title: 'Reset Code Sent',
          description,
          duration: 10000, // Show for 10 seconds if code is displayed
        });
        setResetStep('code');
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || error.message || 'Failed to send reset code.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    } else if (resetStep === 'code') {
      if (!resetCode || resetCode.length < 6) {
        toast({
          title: 'Invalid Code',
          description: 'Please enter a valid 6-digit code.',
          variant: 'destructive',
        });
        return;
      }
      setResetStep('password');
    } else if (resetStep === 'password') {
      if (newPassword !== confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Passwords do not match.',
          variant: 'destructive',
        });
        return;
      }
      setIsLoading(true);
      try {
        passwordSchema.parse(newPassword);
        await api.post('/auth/reset-password', {
          email: forgotPasswordEmail,
          code: resetCode,
          newPassword,
        });
        toast({
          title: 'Password Reset Successful',
          description: 'You can now login with your new password.',
        });
        setForgotPasswordOpen(false);
        setResetStep('email');
        setForgotPasswordEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || error.message || 'Failed to reset password.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't show login page if already authenticated - let useEffect handle redirect
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-105 brightness-[0.52]"
        style={{ backgroundImage: `url('https://bangalorestudy.com/static/media/Central.85c63a34.jpg')` }}
      />
      {/* Overlay for additional dimming */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/45 to-black/55" />
      <div className="pointer-events-none absolute -top-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-success/20 blur-3xl" />

      {/* Card content */}
      <Card className="w-full max-w-md shadow-2xl border-border/40 relative z-10 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-5 border-b border-border/30 bg-gradient-to-b from-background to-background/70">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="rounded-2xl bg-white/90 p-2 shadow-md ring-1 ring-border/40">
              <img src={christLogo} alt="Christ University" className="h-14 w-auto" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Welcome Back</CardTitle>
          <CardDescription className="text-sm font-semibold">Christ (Deemed to be University) Placement Portal</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="login-email" className="font-semibold">Student Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="sample@mca.christuniversity.in"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl border-border/80 bg-background/70"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="login-password" className="font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="pl-10 pr-11 h-12 rounded-xl border-border/80 bg-background/70"
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

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm font-semibold"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot Password?
              </Button>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground tracking-wider">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl flex items-center gap-2 bg-white/70 hover:bg-white"
              disabled={isLoading}
              onClick={() => googleLoginForLogin()}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected sign-in with institutional access control.
            </div>
          </form>
          
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to the university's placement policies.
          </p>
        </CardContent>
      </Card>

      <Dialog open={forgotPasswordOpen} onOpenChange={(open) => {
        setForgotPasswordOpen(open);
        if (!open) {
          setResetStep('email');
          setForgotPasswordEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetStep === 'email' && 'Enter your email to receive a reset code.'}
              {resetStep === 'code' && 'Enter the 6-digit code sent to your email.'}
              {resetStep === 'password' && 'Enter your new password.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {resetStep === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@christuniversity.in"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {resetStep === 'code' && (
              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            )}

            {resetStep === 'password' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForgotPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {resetStep === 'email' && 'Send Code'}
                  {resetStep === 'code' && 'Verify Code'}
                  {resetStep === 'password' && 'Reset Password'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;
