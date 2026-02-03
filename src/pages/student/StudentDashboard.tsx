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
import { Building2, Send, CheckCircle, Clock, Mail, Phone, GraduationCap, FileText, ArrowRight, Loader2, Bell, Edit2, X, Upload, Camera, PartyPopper } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Cropper from 'react-easy-crop';
import api from '@/lib/api';

const StudentDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser, setUserData } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: applications, isLoading: applicationsLoading, refetch: refetchApplications } = useApplications();
  const { data: notifications } = useNotifications();
  const location = useLocation();

  const { toast } = useToast();
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationKey = user?.id ? `placementCelebrated:${user.id}` : null;
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(user?.resumeUrl);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoCropper, setShowPhotoCropper] = useState(false);
  const [photoCrop, setPhotoCrop] = useState({ x: 0, y: 0 });
  const [photoZoom, setPhotoZoom] = useState(1);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string | null>(null);
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoCropperRef = useRef<any>(null);

  // Sync resumeUrl with user data
  useEffect(() => {
    if (user?.resumeUrl) {
      setResumeUrl(user.resumeUrl);
    }
  }, [user?.resumeUrl]);

  // Sync photoUrl with user data
  useEffect(() => {
    if (user?.photoUrl) {
      setPhotoUrl(user.photoUrl);
    }
  }, [user?.photoUrl]);

  const dismissCelebration = () => {
    setShowCelebration(false);
  };

  // Get the company name where student is placed
  const getPlacedCompany = () => {
    const approvedApp = applications?.find(app => app.status === 'approved');
    return approvedApp?.companyId?.name || 'a company';
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

  // Show one-time celebration overlay for placed students after sign-in
  useEffect(() => {
    if (user?.isPlaced && celebrationKey) {
      const alreadyShown = sessionStorage.getItem(celebrationKey);
      if (!alreadyShown) {
        setShowCelebration(true);
        sessionStorage.setItem(celebrationKey, 'true');
      }
    }
  }, [user?.isPlaced, celebrationKey]);

  const onViewResume = () => {
    if (!resumeUrl) return;
    
    try {
      if (resumeUrl.startsWith('data:application/pdf')) {
        // Create a blob from base64 and open it
        const base64Data = resumeUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        // If it's a URL, open it normally
        window.open(resumeUrl, '_blank');
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to open resume. Please try uploading again.', 
        variant: 'destructive' 
      });
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type - check both mime type and extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast({ title: 'Invalid file', description: 'Please upload a PDF file.', variant: 'destructive' });
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
        gpa: profileForm.gpa ? parseFloat(profileForm.gpa) : undefined,
      };

      const response = await api.put(`/users/${user.id}`, updateData);
      
      if (response) {
        await refreshUser();
        toast({ title: 'Success', description: 'Your profile has been updated.' });
        setIsEditMode(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      toast({ 
        title: 'Update failed', 
        description: err?.message || err?.error || 'Please try again.', 
        variant: 'destructive' 
      });
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

  const onPhotoUploadClick = () => {
    if (isEditMode) {
      photoInputRef.current?.click();
    }
  };

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCroppedPhotoUrl(reader.result as string);
      setShowPhotoCropper(true);
      setPhotoCrop({ x: 0, y: 0 });
      setPhotoZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    // Store the cropped area for later use when saving
    photoCropperRef.current = croppedAreaPixels;
  };

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (err) => reject(err));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const onSaveCroppedPhoto = async () => {
    if (!croppedPhotoUrl || !photoCropperRef.current || !user?.id) return;

    setUploadingPhoto(true);
    try {
      const croppedImage = await getCroppedImg(croppedPhotoUrl, photoCropperRef.current);
      await api.put(`/users/${user.id}`, { photoUrl: croppedImage });
      setPhotoUrl(croppedImage);
      await refreshUser();
      setShowPhotoCropper(false);
      setCroppedPhotoUrl(null);
      toast({
        title: 'Success',
        description: 'Profile photo updated successfully!',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const removePhoto = async () => {
    if (!user?.id) return;

    try {
      await api.put(`/users/${user.id}`, { photoUrl: null });
      setPhotoUrl(undefined);
      await refreshUser();
      toast({
        title: 'Success',
        description: 'Profile photo removed',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to remove photo',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const eligibleCompanies = companies?.filter(c => c.min_gpa <= (user?.gpa || 0)).length || 0;
  
  // Filter out applications with missing/null company data
  const validApplications = applications?.filter(app => app.companyId && app.companyId.name) || [];
  const recentApplications = validApplications.slice(0, 3);
  const recentNotifications = notifications?.slice(0, 2) || [];

  const statusCounts = {
    total: validApplications.length,
    shortlisted: validApplications.filter(a => a.status === 'approved').length,
    applied: validApplications.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/80 via-background to-success/80 backdrop-blur-md animate-fade-in">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0, transparent 25%),\
                 radial-gradient(circle at 80% 30%, rgba(255,255,255,0.16) 0, transparent 22%),\
                 radial-gradient(circle at 30% 80%, rgba(255,255,255,0.18) 0, transparent 20%)',
              backgroundSize: '200px 200px'
            }}
          />
          <div className="relative z-10 text-center px-6 max-w-xl">
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-background/70 border border-primary/40 flex items-center justify-center shadow-2xl">
              <PartyPopper className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">Congratulations!</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              You got placed at <span className="font-semibold text-primary">{getPlacedCompany()}</span>! All other company applications are marked as already placed.
            </p>
            <div className="flex items-center justify-center">
              <Button variant="outline" className="w-full sm:w-auto" onClick={dismissCelebration}>
                Go to dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

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
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={user?.name} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-primary mb-4"
                        />
                      ) : (
                        <Avatar className="w-24 h-24 mb-4">
                          <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                            {user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
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
                    <div className="flex flex-col items-center mb-4">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={onPhotoSelected}
                        accept="image/*"
                        className="hidden"
                      />
                      {showPhotoCropper && croppedPhotoUrl ? (
                        <div className="w-full space-y-4">
                          <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                            <Cropper
                              image={croppedPhotoUrl}
                              crop={photoCrop}
                              zoom={photoZoom}
                              aspect={1}
                              cropShape="round"
                              showGrid={false}
                              onCropChange={setPhotoCrop}
                              onCropComplete={onCropComplete}
                              onZoomChange={setPhotoZoom}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">Zoom</Label>
                            <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={photoZoom}
                              onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPhotoCropper(false);
                                setCroppedPhotoUrl(null);
                                if (photoInputRef.current) photoInputRef.current.value = '';
                              }}
                              className="flex-1"
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={onSaveCroppedPhoto}
                              disabled={uploadingPhoto}
                              className="flex-1 gap-2"
                              size="sm"
                            >
                              {uploadingPhoto ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Photo'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative mb-4">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={user?.name} 
                              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            onClick={onPhotoUploadClick}
                            disabled={uploadingPhoto}
                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90"
                          >
                            {uploadingPhoto ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                          </button>
                          {photoUrl && (
                            <button
                              onClick={removePhoto}
                              className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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

                <div className="space-y-2">
                  {resumeUrl && !isEditMode && (
                    <Button variant="outline" className="w-full gap-2" onClick={onViewResume}>
                      <FileText className="w-4 h-4" />
                      View Resume
                    </Button>
                  )}
                  
                  {isEditMode && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={onUploadClick}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading…' : (resumeUrl ? 'Change Resume' : 'Upload Resume')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Notifications */}
            <Card id="notifications" className="animate-slide-up" style={{ animationDelay: '600ms' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Latest Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification._id}
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
