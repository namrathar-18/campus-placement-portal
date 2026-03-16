import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApplications, useCreateApplication } from '@/hooks/useApplications';
import { useCompanies } from '@/hooks/useCompanies';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, IndianRupee, GraduationCap, Clock, CheckCircle, Ban, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeAnalyzerResult {
  score: number;
  fit_level: string;
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  skill_match_percent: number;
  semantic_similarity_percent: number;
}

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: applications = [] } = useApplications();
  const { data: companies = [], isLoading } = useCompanies();
  const createApplication = useCreateApplication();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalyzerResult | null>(null);

  const company = companies.find((c) => c._id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
  const isEligible = userGpa >= (company.min_gpa || 0);
  const isPlaced = user?.isPlaced ?? false;
  const isExpired = new Date(company.deadline) < new Date();
  const studentApplications = applications.filter(app => app.studentId?._id === studentId);
  const hasPlacedApplication = studentApplications.some(app => app.status === 'placed');
  const isPlacementLocked = isPlaced || hasPlacedApplication;
  const hasApplied = studentApplications.some(app => app.companyId?._id === id);

  const analyzerJobDescription = [
    `Company: ${company.name}`,
    `Role: ${company.roles?.[0] || 'N/A'}`,
    `Description: ${company.description || ''}`,
    `Eligibility: ${company.eligibility || ''}`,
    `Requirements: ${(company.requirements || []).join(', ')}`,
  ]
    .filter((item) => item.trim().length > 0)
    .join('\n\n');

  const handleDownloadDetails = () => {
    if (!(company as any).detailsFile) {
      toast({
        title: 'No File Available',
        description: 'This company has not uploaded additional details.',
      });
      return;
    }

    try {
      const base64Data = (company as any).detailsFile;
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `${company.name}_Details.pdf`;
      link.click();
      toast({
        title: 'Download Started',
        description: 'Company details PDF is downloading...',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download the file.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to log in before applying.',
        variant: 'destructive',
      });
      return;
    }

    if (isPlacementLocked) {
      toast({
        title: 'Already Placed! 🎉',
        description: 'You have already been placed and cannot apply to other companies.',
        variant: 'destructive',
      });
      return;
    }

    if (isExpired) {
      toast({
        title: 'Application Deadline Passed',
        description: 'The application deadline for this company has passed.',
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

  const handleResumeAnalyzer = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to log in before using resume analyzer.',
        variant: 'destructive',
      });
      return;
    }

    if (!analyzerJobDescription.trim()) {
      toast({
        title: 'Job Description Missing',
        description: 'Could not prepare job description for this listing.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await api.post('/zenith/resume-analyzer', {
        jobDescription: analyzerJobDescription,
        topKMissing: 10,
      });

      const result = response?.data as ResumeAnalyzerResult;
      setResumeAnalysis(result);

      toast({
        title: 'Resume Analysis Complete',
        description: `Fit score: ${result.score}% for ${company.name}`,
      });
    } catch (error: any) {
      setResumeAnalysis(null);
      toast({
        title: 'Resume Analysis Failed',
        description: error?.message || 'Unable to analyze resume right now.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionButton = () => {
    if (isPlacementLocked) {
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

    if (isExpired) {
      return (
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 rounded-xl"
          disabled
        >
          <Ban className="w-5 h-5" />
          Deadline Expired
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
        {isPlacementLocked && (
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
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg ring-4 ring-white">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-heading font-bold">{company.name}</h1>
                      <Badge className={company.job_type === 'full-time' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}>
                        {company.job_type}
                      </Badge>
                    </div>
                    <p className="text-xl text-muted-foreground mb-4">{company.roles?.[0] || 'Position'}</p>
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
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                  {company.description}
                </p>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-xl font-heading">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {company.industry && (
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <span><strong>Industry:</strong> {company.industry}</span>
                    </li>
                  )}
                  {company.min_gpa > 0 && (
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <span><strong>Minimum GPA:</strong> {company.min_gpa}</span>
                    </li>
                  )}
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
                    <span className="font-semibold">{company.min_gpa}</span>
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

                {(company as any).detailsFile ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl"
                    onClick={handleDownloadDetails}
                  >
                    <Download className="w-4 h-4" />
                    Download Details PDF
                  </Button>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/30 text-muted-foreground text-sm text-center">
                    No additional file uploaded
                  </div>
                )}

                {!isEligible && !isPlaced && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ You need a minimum GPA of {company.min_gpa} to apply for this position.
                    </p>
                  </div>
                )}

                {getActionButton()}

                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl"
                  disabled={!isEligible || isExpired || isAnalyzing}
                  onClick={handleResumeAnalyzer}
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isAnalyzing ? 'Analyzing Resume...' : 'Check if your resume fits with this listing'}
                </Button>

                {resumeAnalysis && (
                  <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Resume Fit Score</p>
                      <Badge className="bg-success/10 text-success border border-success/20">
                        {resumeAnalysis.score}%
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{resumeAnalysis.summary}</p>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Skill Match: {resumeAnalysis.skill_match_percent}%</p>
                      <p>Semantic Similarity: {resumeAnalysis.semantic_similarity_percent}%</p>
                    </div>

                    {resumeAnalysis.matched_skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-success">Matched Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.matched_skills.slice(0, 8).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[11px]">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeAnalysis.missing_skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-destructive">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.missing_skills.slice(0, 8).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[11px] border-destructive/30 text-destructive">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
