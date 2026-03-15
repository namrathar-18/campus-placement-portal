import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApplications } from '@/hooks/useApplications';
import { useCompanies } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Globe, MapPin, Calendar, Briefcase, IndianRupee, GraduationCap, FileDown, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const placedStatuses = new Set(['approved', 'selected', 'placed']);

const normalizeUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const PlacedCompany = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: applications = [], isLoading: applicationsLoading } = useApplications();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { toast } = useToast();

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

  if (user.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  if (applicationsLoading || companiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasPlacedApplication = applications.some((app) =>
    placedStatuses.has(String(app?.status || '').trim().toLowerCase())
  );

  if (!user.isPlaced && !hasPlacedApplication) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-heading font-bold">Placed Company Details</h1>
              <p className="text-muted-foreground">
                This page is enabled once your application status is updated to placed.
              </p>
              <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const placedApplication = applications.find((app) =>
    placedStatuses.has(String(app?.status || '').trim().toLowerCase())
  );

  const placedCompanyId =
    typeof placedApplication?.companyId === 'string'
      ? placedApplication.companyId
      : placedApplication?.companyId?._id;

  const placedCompany = companies.find((company) => company._id === placedCompanyId);

  const companyName =
    placedCompany?.name ||
    (typeof placedApplication?.companyId === 'object' ? placedApplication?.companyId?.name : '') ||
    'Your placed company';

  const baseCompanyUrl = normalizeUrl((placedCompany as any)?.websiteUrl || '');
  const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${companyName} careers`)}`;
  const companyUrl = baseCompanyUrl || fallbackSearchUrl;

  const handleDownloadDetails = () => {
    if (!(placedCompany as any)?.detailsFile) {
      toast({
        title: 'No file available',
        description: 'No additional company details file has been uploaded.',
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = (placedCompany as any).detailsFile;
      link.download = `${companyName.replace(/\s+/g, '_')}_Details.pdf`;
      link.click();
      toast({
        title: 'Download started',
        description: 'Company details file is downloading.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Unable to download the company details file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-heading font-bold mb-2">Placed Company Details</h1>
          <p className="text-muted-foreground">
            Complete details of the company where you are placed.
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg ring-2 ring-white">
                {companyName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-heading font-bold">{companyName}</h2>
                  <Badge className="bg-success/10 text-success">Placed</Badge>
                </div>
                <p className="text-muted-foreground">
                  {placedCompany?.roles?.[0] || 'Role details will be updated by the placement team'}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="w-4 h-4" />
                  Company URL
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open(companyUrl, '_blank', 'noopener,noreferrer')}
                >
                  <span className="truncate text-left">{baseCompanyUrl || 'Search company careers page'}</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Placement Updated
                </div>
                <p className="font-semibold">
                  {placedApplication?.updatedAt
                    ? new Date(placedApplication.updatedAt).toLocaleDateString()
                    : placedApplication?.appliedDate
                      ? new Date(placedApplication.appliedDate).toLocaleDateString()
                      : 'Not available'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <p className="font-semibold">{placedCompany?.location || 'Not available'}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <IndianRupee className="w-4 h-4" />
                  Package
                </div>
                <p className="font-semibold">{placedCompany?.salary || (placedCompany?.package ? `INR ${placedCompany.package}` : 'Not available')}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="w-4 h-4" />
                  Job Type
                </div>
                <p className="font-semibold">{placedCompany?.job_type || 'Not available'}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <GraduationCap className="w-4 h-4" />
                  Minimum GPA
                </div>
                <p className="font-semibold">
                  {typeof placedCompany?.min_gpa === 'number' ? placedCompany.min_gpa : 'Not available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="font-medium">{placedCompany?.industry || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Eligibility</p>
                <p className="font-medium whitespace-pre-line">{placedCompany?.eligibility || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Application Deadline</p>
                <p className="font-medium">
                  {placedCompany?.deadline ? new Date(placedCompany.deadline).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {placedCompany?.requirements && placedCompany.requirements.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5 text-sm">
                  {placedCompany.requirements.map((requirement, index) => (
                    <li key={`${requirement}-${index}`}>{requirement}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific requirements listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {placedCompany?.description || 'Detailed description is not available yet.'}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 pb-2">
          <Button
            variant="hero"
            className="gap-2"
            onClick={() => window.open(companyUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-4 h-4" />
            Open Company URL
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleDownloadDetails}>
            <FileDown className="w-4 h-4" />
            Download Company Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlacedCompany;
