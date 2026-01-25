import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/cards/StatsCard';
import { Building2, Send, CheckCircle, Clock, Mail, Phone, GraduationCap, FileText, ArrowRight, Loader2, Bell, Edit2, X } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const StudentDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser, setUserData } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: applications, isLoading: applicationsLoading } = useApplications();
  const { data: notifications } = useNotifications();
  const location = useLocation();

  const { toast } = useToast();
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(user?.resumeUrl);
  const [uploading, setUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    department: user?.department || '',
    section: user?.section || '',
    registerNumber: user?.registerNumber || '',
    gpa: user?.gpa?.toString() || '',
  });
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

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({ title: 'Invalid file', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file smaller than 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        try {
          await api.put(`/users/${user.id}`, { resumeUrl: base64String });
          setResumeUrl(base64String);
          await refreshUser();
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

  const onSaveProfile = async () => {
    if (!user?.id) return;

    // Validate GPA
    if (profileForm.gpa) {
      const gpa = parseFloat(profileForm.gpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        toast({ title: 'Error', description: 'GPA must be between 0 and 10', variant: 'destructive' });
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const updateData = {
        phone: profileForm.phone,
        department: profileForm.department,
        section: profileForm.section,
        registerNumber: profileForm.registerNumber,
        ...(profileForm.gpa && { gpa: parseFloat(profileForm.gpa) }),
      };

      await api.put(`/users/${user.id}`, updateData);
      setUserData(updateData);
      await refreshUser();
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      setIsEditMode(false);
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      phone: user?.phone || '',
      department: user?.department || '',
      section: user?.section || '',
      registerNumber: user?.registerNumber || '',
      gpa: user?.gpa?.toString() || '',
    });
    setIsEditMode(false);
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
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">My Profile</CardTitle>
                {!isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    className="gap-1 h-8 px-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEditMode ? (
                  <>
                    {/* View Mode */}
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
                  </>
                ) : (
                  <>
                    {/* Edit Mode */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="registerNumber" className="text-sm">
                          Register Number
                        </Label>
                        <Input
                          id="registerNumber"
                          value={profileForm.registerNumber}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, registerNumber: e.target.value })
                          }
                          placeholder="e.g., CHR20XX001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="e.g., 9876543210"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm">
                          Department
                        </Label>
                        <Input
                          id="department"
                          value={profileForm.department}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, department: e.target.value })
                          }
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="section" className="text-sm">
                          Section
                        </Label>
                        <Input
                          id="section"
                          value={profileForm.section}
                          onChange={(e) => setProfileForm({ ...profileForm, section: e.target.value })}
                          placeholder="e.g., A"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gpa" className="text-sm">
                          Current GPA (0-10)
                        </Label>
                        <Input
                          id="gpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={profileForm.gpa}
                          onChange={(e) => setProfileForm({ ...profileForm, gpa: e.target.value })}
                          placeholder="e.g., 8.5"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={onSaveProfile}
                          disabled={isSavingProfile}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSavingProfile}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileSelected}
                />

                {isEditMode ? null : (
                  <>
                    {resumeUrl ? (
                      <Button variant="outline" className="w-full gap-2" onClick={onViewResume}>
                        <FileText className="w-4 h-4" />
                        View Resume
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={onUploadClick}
                        disabled={uploading}
                      >
                        <FileText className="w-4 h-4" />
                        {uploading ? 'Uploading…' : 'Upload Resume'}
                      </Button>
                    )}
                  </>
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
