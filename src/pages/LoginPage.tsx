import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import christLogo from '@/assets/christ-university-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const validStudentEmailDomains = ['@mca.christuniversity.in', '@mscaiml.christuniversity.in'];
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'officer'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine if using registerNumber or email based on userType
      const isRegisterNumber = userType === 'student';
      
      const { error } = await signIn(credentials.id, credentials.password, isRegisterNumber);
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        // Navigation will be handled by the useAuth hook based on role
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl animate-scale-in rounded-2xl">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <img 
              src={christLogo} 
              alt="Christ University Logo" 
              className="h-16 w-auto object-contain bg-white rounded-lg p-1"
            />
          </div>
          <CardTitle className="text-2xl font-heading">Christ University</CardTitle>
          <CardDescription>Sign in to access the Placement Portal</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Login As</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={userType === 'student' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setUserType('student');
                    setCredentials({ id: '', password: '' });
                  }}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={userType === 'officer' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setUserType('officer');
                    setCredentials({ id: '', password: '' });
                  }}
                >
                  Placement Officer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id">
                {userType === 'student' ? 'Register Number' : 'Email / User ID'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="id"
                  placeholder={userType === 'student' ? 'Enter your register number' : 'Enter your email or ID'}
                  value={credentials.id}
                  onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Students:</strong> Login with your register number
            </p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              <strong>Placement Officers:</strong> Login with your email/ID
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
