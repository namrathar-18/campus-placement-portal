import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/cards/StatsCard';
import { Building2, Send, CheckCircle, Clock, Mail, Phone, GraduationCap, FileText, ArrowRight, Loader2, Bell } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const StudentDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: applications, isLoading: applicationsLoading } = useApplications();
  const { data: notifications } = useNotifications();
  const location = useLocation();

  const { toast } = useToast();
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(user?.resumeUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onViewResume = () => {
    if (resumeUrl) {
      // If it's a base64 string, open it directly
      if (resumeUrl.startsWith('data:')) {
        window.open(resumeUrl, '_blank');
      } else {
        // If it's a URL, open it normally
        window.open(resumeUrl, '_blank');
      }
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        try {
          await api.put(`/users/${user.id}`, { resumeUrl: base64String });
          setResumeUrl(base64String);
          toast({ title: 'Resume uploaded', description: 'Your resume has been saved successfully.' });
        } catch (err: any) {
          toast({ title: 'Upload failed', description: err?.message || 'Please try again.', variant: 'destructive' });
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Please try again.', variant: 'destructive' });
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const eligibleCompanies = companies?.filter(c => c.min_gpa <= (user?.gpa || 0)).length || 0;
  const recentApplications = applications?.slice(0, 3) || [];
  const recentNotifications = notifications?.slice(0, 2) || [];

  const statusCounts = {
    total: applications?.length || 0,
    shortlisted: applications?.filter(a => a.status === 'shortlisted').length || 0,
    applied: applications?.filter(a => a.status === 'applied').length || 0,
  };

  // Scroll to notifications section if hash is present
  useEffect(() => {
    if (location.hash === '#notifications') {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const element = document.getElementById('notifications');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your placement journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatsCard
              title="Eligible Companies"
              value={companiesLoading ? '-' : eligibleCompanies}
              icon={Building2}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title="Applications Sent"
              value={applicationsLoading ? '-' : statusCounts.total}
              icon={Send}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Shortlisted"
              value={applicationsLoading ? '-' : statusCounts.shortlisted}
              icon={CheckCircle}
              variant="warning"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Pending Response"
              value={applicationsLoading ? '-' : statusCounts.applied}
              icon={Clock}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-heading font-semibold text-xl">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.registerNumber || 'Student'}</p>
                  {user?.isPlaced && (
                    <Badge className="mt-2 bg-success/10 text-success">Placed ✓</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {user?.department && (
                    <div className="flex items-center gap-3 text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{user.department} {user.section && `- Section ${user.section}`}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <span className="text-sm font-medium">Current GPA</span>
                    <span className="text-lg font-bold text-success">{user?.gpa || 'N/A'}</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileSelected}
                />
                {resumeUrl ? (
                  <Button variant="outline" className="w-full gap-2" onClick={onViewResume}>
                    <FileText className="w-4 h-4" />
                    View Resume
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full gap-2" onClick={onUploadClick} disabled={uploading}>
                    <FileText className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Upload Resume'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <Link to="/student/applications">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {app.companies.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{app.companies.name}</p>
                          <p className="text-sm text-muted-foreground">{app.companies.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{app.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No applications yet</p>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card id="notifications" className="animate-slide-up" style={{ animationDelay: '600ms' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Latest Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border ${
                        notification.type === 'success'
                          ? 'bg-success/5 border-success/20'
                          : notification.type === 'warning'
                          ? 'bg-warning/5 border-warning/20'
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell className={`w-5 h-5 mt-0.5 ${
                          notification.type === 'success' ? 'text-success' :
                          notification.type === 'warning' ? 'text-warning' : 'text-primary'
                        }`} />
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No notifications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
