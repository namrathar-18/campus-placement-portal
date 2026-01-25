import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Progress } from '@/components/ui/progress';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUserData, refreshUser } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(user?.resumeUrl);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [step, setStep] = useState<'profile' | 'resume' | 'complete'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    registerNumber: user?.registerNumber || '',
    phone: user?.phone || '',
    department: user?.department || '',
    section: user?.section || '',
    gpa: user?.gpa || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    // If user already has complete profile, redirect to dashboard
    if (user?.registerNumber && user?.phone && user?.department && user?.gpa) {
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
    if (!profileData.gpa || parseFloat(profileData.gpa) < 0 || parseFloat(profileData.gpa) > 10) {
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
      const response = await api.put(`/users/${user?.id}`, {
        registerNumber: profileData.registerNumber,
        phone: profileData.phone,
        department: profileData.department,
        section: profileData.section,
        gpa: parseFloat(profileData.gpa),
      });

      if (response.data?.success) {
        setUserData(profileData);
        toast({ title: 'Success', description: 'Profile details saved successfully!' });
        setStep('resume');
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

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
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
            setUserData({ resumeUrl: base64String });
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

  const handleCompleteSetup = () => {
    navigate('/student/dashboard');
  };

  const progressPercentage = step === 'profile' ? 33 : step === 'resume' ? 66 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {step === 'profile' && (
          <Card className="shadow-xl animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-blue-100">
                Help us know more about you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Register Number */}
                <div className="space-y-2">
                  <Label htmlFor="registerNumber" className="text-sm font-medium">
                    Register Number *
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
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
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
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department *
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
                  <Label htmlFor="section" className="text-sm font-medium">
                    Section *
                  </Label>
                  <Input
                    id="section"
                    placeholder="e.g., A"
                    value={profileData.section}
                    onChange={(e) => setProfileData({ ...profileData, section: e.target.value })}
                    required
                  />
                </div>

                {/* GPA */}
                <div className="space-y-2">
                  <Label htmlFor="gpa" className="text-sm font-medium">
                    Current GPA (0-10) *
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Resume
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'resume' && (
          <Card className="shadow-xl animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Upload Your Resume
              </CardTitle>
              <CardDescription className="text-purple-100">
                This will help companies review your qualifications (Optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Resume Upload Area */}
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onResumeSelected}
                    accept=".pdf"
                    className="hidden"
                  />

                  {resumeUrl ? (
                    <div className="space-y-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="font-semibold text-gray-800">Resume Uploaded Successfully</p>
                      <p className="text-sm text-gray-600">
                        You can change your resume anytime from your dashboard
                      </p>
                      <Button
                        variant="outline"
                        onClick={onResumeUploadClick}
                        disabled={uploadingResume}
                        className="w-full gap-2"
                      >
                        {uploadingResume ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Change Resume
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-purple-500 mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-800">Click to upload your resume</p>
                        <p className="text-sm text-gray-600">PDF only, max 5MB</p>
                      </div>
                      <Button
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
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('profile')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('complete')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card className="shadow-xl animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <CardTitle className="text-2xl">Profile Setup Complete!</CardTitle>
              <CardDescription className="text-green-100 mt-2">
                You're all set to explore placement opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 text-center">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Your profile information and resume have been saved. You can update them anytime from your dashboard.
                  </p>
                </div>
                <Button
                  onClick={handleCompleteSetup}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 py-6 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
