import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApplications, useCreateApplication } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockCompanies } from '@/data/mockData';
import { ArrowLeft, MapPin, Calendar, Briefcase, IndianRupee, GraduationCap, Clock, FileText, CheckCircle, Ban, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: applications = [] } = useApplications();
  const createApplication = useCreateApplication();
  const { toast } = useToast();

  const company = mockCompanies.find((c) => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Company not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const userGpa = user?.gpa || 0;
  const studentId = user?.id || '';
  const isEligible = userGpa >= company.minGpa;
  const isPlaced = user?.isPlaced ?? false;
  const studentApplications = applications.filter(app => app.studentId?._id === studentId);
  const hasApplied = studentApplications.some(app => app.companyId?._id === id);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to log in before applying.',
        variant: 'destructive',
      });
      return;
    }

    if (isPlaced) {
      toast({
        title: 'Already Placed! 🎉',
        description: 'You have already been placed and cannot apply to other companies.',
        variant: 'destructive',
      });
      return;
    }

    if (hasApplied) {
      toast({
        title: 'Already Applied',
        description: 'You have already applied to this company.',
      });
      return;
    }

    try {
      await createApplication.mutateAsync({ companyId: id! });
      toast({
        title: 'Application Submitted! ✨',
        description: `You have successfully applied to ${company.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Application Failed',
        description: error?.message || 'Could not submit your application.',
        variant: 'destructive',
      });
    }
  };

  const getActionButton = () => {
    if (isPlaced) {
      return (
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 rounded-xl"
          disabled
        >
          <Ban className="w-5 h-5" />
          Already Placed
        </Button>
      );
    }

    if (hasApplied) {
      return (
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 rounded-xl border-success/30 text-success bg-success/10"
          disabled
        >
          <CheckCircle2 className="w-5 h-5" />
          Application Submitted
        </Button>
      );
    }

    return (
      <Button
        variant="hero"
        size="lg"
        className="w-full rounded-xl"
        disabled={!isEligible}
        onClick={handleApply}
      >
        {isEligible ? 'Apply Now' : 'Not Eligible'}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2 rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Placed Student Banner */}
        {isPlaced && (
          <div className="mb-6 p-4 rounded-2xl bg-success/10 border border-success/30 flex items-center gap-4 animate-slide-up">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-success">Congratulations! You're Placed 🎉</h3>
              <p className="text-sm text-muted-foreground">
                You have been placed and cannot apply to other companies.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="animate-fade-in rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-heading font-bold">{company.name}</h1>
                      <Badge className={company.jobType === 'Full-time' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}>
                        {company.jobType}
                      </Badge>
                    </div>
                    <p className="text-xl text-muted-foreground mb-4">{company.role}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {company.location}
                      </div>
                      <div className="flex items-center gap-2 text-success font-semibold">
                        <IndianRupee className="w-4 h-4" />
                        {company.salary}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-xl font-heading">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-xl font-heading">Qualifications Required</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <span>{company.qualifications}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <span>Minimum GPA of {company.minGpa} required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <span>Strong problem-solving and analytical skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <span>Excellent communication and teamwork abilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24 animate-slide-up rounded-2xl" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Deadline</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(company.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm">Min. GPA</span>
                    </div>
                    <span className="font-semibold">{company.minGpa}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Your GPA</span>
                    </div>
                    <span className={`font-semibold ${isEligible ? 'text-success' : 'text-destructive'}`}>
                      {userGpa}
                    </span>
                  </div>
                </div>

                {!isEligible && !isPlaced && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ You need a minimum GPA of {company.minGpa} to apply for this position.
                    </p>
                  </div>
                )}

                {getActionButton()}

                <p className="text-xs text-center text-muted-foreground">
                  By applying, you agree to share your profile with {company.name}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
