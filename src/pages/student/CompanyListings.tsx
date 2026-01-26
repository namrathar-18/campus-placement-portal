import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications, useCreateApplication } from '@/hooks/useApplications';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Building2, CheckCircle2, MapPin, Calendar, Briefcase, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const CompanyListings = () => {
  const { user } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: myApplications } = useApplications();
  const applyMutation = useCreateApplication();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  const userGpa = user?.gpa || 0;
  const isPlaced = user?.isPlaced || false;

  const filteredCompanies = companies?.filter((company) => {
    const searchTarget = `${company.name} ${(company.roles || []).join(' ')} ${company.industry || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchesJobType = jobTypeFilter === 'all' || company.job_type === jobTypeFilter;
    const matchesEligibility = !showEligibleOnly || company.min_gpa <= userGpa;

    return matchesSearch && matchesJobType && matchesEligibility;
  }) || [];

  const hasApplied = (companyId: string) => {
    if (!myApplications || myApplications.length === 0) return false;
    return myApplications.some(app => {
      const appCompanyId = app.companyId?._id || app.companyId;
      return appCompanyId === companyId;
    });
  };

  const handleApply = async (companyId: string) => {
    if (!user) {
      toast({
        title: 'Please Login',
        description: 'You need to login to apply for jobs.',
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

    if (hasApplied(companyId)) {
      toast({
        title: 'Already Applied',
        description: 'You have already applied to this company.',
      });
      return;
    }

    try {
      await applyMutation.mutateAsync({ companyId });
      const company = companies?.find((c) => c._id === companyId);
      toast({
        title: 'Application Submitted! ✨',
        description: `You have successfully applied to ${company?.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application.',
        variant: 'destructive',
      });
    }
  };

  if (companiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Upcoming Companies
          </h1>
          <p className="text-muted-foreground">
            Browse and apply to companies visiting our campus
          </p>
        </div>

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

        {/* Filters */}
        <div className="bg-card rounded-2xl p-6 mb-8 border border-border/50 shadow-card animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search companies or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </div>

            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showEligibleOnly ? 'default' : 'outline'}
              onClick={() => setShowEligibleOnly(!showEligibleOnly)}
              className="gap-2 h-12 rounded-xl px-6"
            >
              <Filter className="w-4 h-4" />
              Eligible Only
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>
                Showing <span className="font-semibold text-foreground">{filteredCompanies.length}</span> of {companies?.length || 0} companies
              </span>
            </div>
            {user && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Your GPA: {userGpa || 'N/A'}
              </Badge>
            )}
            {isPlaced && (
              <Badge className="bg-success/10 text-success border-success/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Placed
              </Badge>
            )}
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => {
            const isEligible = company.min_gpa <= userGpa;
            const applied = hasApplied(company._id);
            const isExpired = new Date(company.deadline) < new Date();
            
            return (
              <Card
                key={company._id}
                className="group hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                      {company.name.charAt(0)}
                    </div>
                    <Badge
                      variant="outline"
                      className={company.job_type === 'Full-time' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}
                    >
                      {company.job_type}
                    </Badge>
                  </div>

                  <Link to={`/company/${company._id}`}>
                    <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4">{company.role}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-success" />
                      <span className="font-medium text-success">{company.salary}</span>
                    </div>
                    {company.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(company.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Badge variant={isEligible ? 'outline' : 'secondary'} className={isEligible ? 'bg-success/10 text-success' : ''}>
                      Min GPA: {company.min_gpa}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Link to={`/company/${company._id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={applied ? 'outline' : 'hero'}
                        disabled={!isEligible || isPlaced || applied || isExpired || applyMutation.isPending}
                        onClick={() => handleApply(company._id)}
                      >
                        {applyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : applied ? (
                          'Applied'
                        ) : isPlaced ? (
                          'Placed'
                        ) : isExpired ? (
                          'Expired'
                        ) : !isEligible ? (
                          'Not Eligible'
                        ) : (
                          'Apply Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyListings;
