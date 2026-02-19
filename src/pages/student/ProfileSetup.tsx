import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Loader2, Camera, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '@/lib/api';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUserData, refreshUser } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(user?.resumeUrl);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoCropper, setShowPhotoCropper] = useState(false);
  const [photoCrop, setPhotoCrop] = useState({ x: 0, y: 0 });
  const [photoZoom, setPhotoZoom] = useState(1);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoCropperRef = useRef<any>(null);

  const [profileData, setProfileData] = useState({
    registerNumber: user?.registerNumber || '',
    phone: user?.phone || '',
    department: user?.department || '',
    section: user?.section === 'A' || user?.section === 'B' ? user.section : '',
    gender: user?.gender === 'male' || user?.gender === 'female' ? user.gender : '',
    gpa: user?.gpa?.toString() || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    // If user already has complete profile, redirect to dashboard
    if (user?.registerNumber && user?.phone && user?.department && user?.section && user?.gender && user?.gpa) {
      navigate('/student/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const validateProfileData = () => {
    if (!profileData.registerNumber.trim()) {
      toast({ title: 'Error', description: 'Register number is required', variant: 'destructive' });
      return false;
    }
    if (!profileData.phone.trim()) {
      toast({ title: 'Error', description: 'Phone number is required', variant: 'destructive' });
      return false;
    }
    if (!profileData.department.trim()) {
      toast({ title: 'Error', description: 'Department is required', variant: 'destructive' });
      return false;
    }
    if (!profileData.section.trim()) {
      toast({ title: 'Error', description: 'Section is required', variant: 'destructive' });
      return false;
    }
    if (profileData.section !== 'A' && profileData.section !== 'B') {
      toast({ title: 'Error', description: 'Section must be either A or B', variant: 'destructive' });
      return false;
    }
    if (profileData.gender !== 'male' && profileData.gender !== 'female') {
      toast({ title: 'Error', description: 'Gender is required', variant: 'destructive' });
      return false;
    }
    const gpaValue = parseFloat(profileData.gpa);
    if (!profileData.gpa || isNaN(gpaValue) || gpaValue < 0 || gpaValue > 10) {
      toast({ title: 'Error', description: 'GPA must be between 0 and 10', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileData()) return;

    setIsLoading(true);
    try {
      const updateData = {
        registerNumber: profileData.registerNumber,
        phone: profileData.phone,
        department: profileData.department,
        section: profileData.section as 'A' | 'B',
        gender: profileData.gender as 'male' | 'female',
        gpa: parseFloat(profileData.gpa),
      };

      const response = await api.put(`/users/${user?.id}`, updateData);

      if (response) {
        await refreshUser();
        toast({ title: 'Success', description: 'Profile setup complete! Redirecting to dashboard...' });
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResumeUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onResumeSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type - check both mime type and extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingResume(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;

        try {
          const response = await api.put(`/users/${user.id}`, { resumeUrl: base64String });
          if (response.data?.success) {
            setResumeUrl(base64String);
            await refreshUser();
            toast({
              title: 'Success',
              description: 'Resume uploaded successfully!',
            });
          }
        } catch (err: any) {
          toast({
            title: 'Upload failed',
            description: err?.message || 'Please try again.',
            variant: 'destructive',
          });
        } finally {
          setUploadingResume(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
      setUploadingResume(false);
    }
  };

  const onPhotoUploadClick = () => {
    photoInputRef.current?.click();
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
      const response = await api.put(`/users/${user.id}`, { photoUrl: croppedImage });
      if (response.data?.success) {
        setPhotoUrl(croppedImage);
        await refreshUser();
        setShowPhotoCropper(false);
        setCroppedPhotoUrl(null);
        toast({
          title: 'Success',
          description: 'Profile photo updated successfully!',
        });
      }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Let's set up your student profile to get started</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Fill in your academic and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Register Number */}
                  <div className="space-y-2">
                    <Label htmlFor="registerNumber">
                      Register Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="registerNumber"
                      placeholder="e.g., CHR20XX001"
                      value={profileData.registerNumber}
                      onChange={(e) =>
                        setProfileData({ ...profileData, registerNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="department"
                      placeholder="e.g., Computer Science"
                      value={profileData.department}
                      onChange={(e) =>
                        setProfileData({ ...profileData, department: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Section */}
                  <div className="space-y-2">
                    <Label htmlFor="section">
                      Section <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profileData.section}
                      onValueChange={(value) => setProfileData({ ...profileData, section: value })}
                    >
                      <SelectTrigger id="section">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value: 'male' | 'female') =>
                        setProfileData({ ...profileData, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* GPA */}
                  <div className="space-y-2">
                    <Label htmlFor="gpa">
                      Current GPA (0-10) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g., 8.5"
                      value={profileData.gpa}
                      onChange={(e) => setProfileData({ ...profileData, gpa: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving Profile...
                      </>
                    ) : (
                      'Save Profile & Continue'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Resume Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Upload (Optional)</CardTitle>
              <CardDescription>Upload your resume for companies to review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onResumeSelected}
                  accept=".pdf"
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onResumeUploadClick}
                    disabled={uploadingResume}
                    className="gap-2"
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {resumeUrl ? 'Change Resume' : 'Upload Resume'}
                      </>
                    )}
                  </Button>

                  {resumeUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 text-success" />
                      <span>Resume uploaded successfully</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  PDF only, maximum file size 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo (Optional)</CardTitle>
              <CardDescription>Upload and crop your profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={onPhotoSelected}
                  accept="image/*"
                  className="hidden"
                />

                {showPhotoCropper && croppedPhotoUrl ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
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
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={onSaveCroppedPhoto}
                        disabled={uploadingPhoto}
                        className="flex-1 gap-2"
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
                  <div className="flex flex-col items-center gap-4">
                    {photoUrl ? (
                      <div className="relative">
                        <img 
                          src={photoUrl} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={onPhotoUploadClick}
                      disabled={uploadingPhoto}
                      className="gap-2"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          {photoUrl ? 'Change Photo' : 'Upload Photo'}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center">
                  JPG, PNG or GIF (Maximum 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
