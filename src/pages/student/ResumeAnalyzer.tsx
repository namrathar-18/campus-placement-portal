import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface ResumeAnalyzerResult {
  score: number;
  fit_level: string;
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  skill_match_percent: number;
  semantic_similarity_percent: number;
}

const buildCompanyJobDescription = (company: any) =>
  [
    `Company: ${company?.name || ''}`,
    `Role: ${company?.roles?.[0] || company?.role || 'N/A'}`,
    `Description: ${company?.description || ''}`,
    `Eligibility: ${company?.eligibility || ''}`,
    `Requirements: ${(company?.requirements || []).join(', ')}`,
  ]
    .filter((item) => item.trim().length > 0)
    .join('\n\n');

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId') || '';
  const { data: companies = [] } = useCompanies();
  const { toast } = useToast();

  const selectedCompany = useMemo(() => companies.find((company) => company._id === companyId), [companies, companyId]);

  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileDataUrl, setResumeFileDataUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalyzerResult | null>(null);

  useEffect(() => {
    if (!selectedCompany) {
      return;
    }

    setJobDescription(buildCompanyJobDescription(selectedCompany));
  }, [selectedCompany]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadedFileName(file.name);
    setResult(null);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        setResumeFileDataUrl(String(reader.result || ''));
        setResumeText('');
      };
      reader.onerror = () => {
        toast({
          title: 'Upload Error',
          description: 'Could not read the PDF file.',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    if (file.type === 'text/plain') {
      const text = await file.text();
      setResumeText(text.slice(0, 20000));
      setResumeFileDataUrl('');
      return;
    }

    toast({
      title: 'Unsupported File',
      description: 'Please upload a PDF or TXT resume file.',
      variant: 'destructive',
    });
    setUploadedFileName('');
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Job Description Required',
        description: 'Please add or fetch a job description before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    if (!resumeFileDataUrl && !resumeText.trim()) {
      toast({
        title: 'Resume Required',
        description: 'Upload a PDF/TXT resume or paste resume text to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await api.post('/zenith/resume-analyzer', {
        jobDescription,
        resumeText: resumeText.trim() || undefined,
        resumeFileDataUrl: resumeFileDataUrl || undefined,
        topKMissing: 10,
      });

      setResult(response.data as ResumeAnalyzerResult);
      toast({
        title: 'Analysis Complete',
        description: 'Your resume was analyzed successfully.',
      });
    } catch (error: any) {
      setResult(null);
      toast({
        title: 'Resume Analysis Failed',
        description: error?.message || 'Unable to analyze resume right now.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6 gap-2 rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Resume Analyzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedCompany && (
                <div className="p-3 rounded-xl bg-muted/40 border text-sm">
                  <p className="font-medium">Job listing selected: {selectedCompany.name}</p>
                  <p className="text-muted-foreground">JD is auto-fetched. You can edit it below.</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Resume (PDF or TXT)</p>
                <Input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="rounded-xl" />
                {uploadedFileName && <p className="text-xs text-muted-foreground">Selected file: {uploadedFileName}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Or paste Resume Text</p>
                <Textarea
                  value={resumeText}
                  onChange={(event) => {
                    setResumeText(event.target.value);
                    if (event.target.value.trim()) {
                      setResumeFileDataUrl('');
                    }
                  }}
                  placeholder="Paste resume text here..."
                  className="min-h-[140px] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Job Description</p>
                <Textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste job description here or open this page from a company listing to auto-fill it."
                  className="min-h-[180px] rounded-xl"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                className="w-full rounded-xl gap-2"
                variant="hero"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume vs Job Description'}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result && (
                <div className="p-6 rounded-xl border bg-muted/30 text-sm text-muted-foreground">
                  Upload your resume and run analysis to see matching and missing skills.
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <p className="font-semibold">Resume Fit Score</p>
                    <Badge className="bg-success/10 text-success border border-success/20">{result.score}%</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{result.summary}</p>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Skill Match: {result.skill_match_percent}%</p>
                    <p>Semantic Similarity: {result.semantic_similarity_percent}%</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-success">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.length ? (
                        result.matched_skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No direct skill matches found.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills.length ? (
                        result.missing_skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs border-destructive/30 text-destructive">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No major skills missing for this JD.</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-sm text-success flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    Use missing skills to improve your resume before applying.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
