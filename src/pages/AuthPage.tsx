import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import christLogo from '@/assets/christ-university-logo.png';
import { z } from 'zod';
import api from '@/lib/api';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    // Only redirect if authenticated AND not currently loading
    if (isAuthenticated && user && !authLoading) {
      if (user.role === 'placement_officer') {
        navigate('/officer/dashboard', { replace: true });
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
      emailSchema.parse(loginData.email);
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

    const { error } = await signIn(loginData.email, loginData.password);
    
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(signupData.email);
      passwordSchema.parse(signupData.password);
      nameSchema.parse(signupData.name);
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

    const { error } = await signUp(signupData.email, signupData.password, signupData.name);
    
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Account Created! 🎉',
        description: 'Let\'s complete your profile!',
      });
      // Redirect to profile setup after successful signup
      navigate('/student/profile-setup');
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 px-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <img src={christLogo} alt="Christ University" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-xl">Welcome to Campus Placement Portal</CardTitle>
          <CardDescription>Christ (Deemed to be University) Placement Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@christuniversity.in"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
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
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@christuniversity.in"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
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
