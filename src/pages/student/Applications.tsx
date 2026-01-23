import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApplications, Application } from '@/hooks/useApplications';
import { FileText, Loader2, Building2, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

const statusConfig = {
  applied: { label: 'Applied', color: 'bg-muted text-muted-foreground', icon: Clock },
  shortlisted: { label: 'Shortlisted', color: 'bg-accent/10 text-accent', icon: Users },
  interview: { label: 'Interview', color: 'bg-warning/10 text-warning', icon: Users },
  selected: { label: 'Selected', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const Applications = () => {
  const { data: applications, isLoading } = useApplications();
  const [activeTab, setActiveTab] = useState('all');

  const getFilteredApplications = (status: string): Application[] => {
    if (!applications) return [];
    if (status === 'all') return applications;
    return applications.filter((app) => app.status === status);
  };

  const statusCounts = {
    all: applications?.length || 0,
    applied: applications?.filter((a) => a.status === 'applied').length || 0,
    shortlisted: applications?.filter((a) => a.status === 'shortlisted').length || 0,
    interview: applications?.filter((a) => a.status === 'interview').length || 0,
    selected: applications?.filter((a) => a.status === 'selected').length || 0,
    rejected: applications?.filter((a) => a.status === 'rejected').length || 0,
  };

  if (isLoading) {
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
            My Applications
          </h1>
          <p className="text-muted-foreground">
            Track the status of all your job applications
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="all" className="gap-2">
              All <span className="text-xs bg-muted px-1.5 rounded">{statusCounts.all}</span>
            </TabsTrigger>
            <TabsTrigger value="applied" className="gap-2">
              Applied <span className="text-xs bg-muted px-1.5 rounded">{statusCounts.applied}</span>
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="gap-2">
              Shortlisted <span className="text-xs bg-accent/20 px-1.5 rounded">{statusCounts.shortlisted}</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-2">
              Interview <span className="text-xs bg-warning/20 px-1.5 rounded">{statusCounts.interview}</span>
            </TabsTrigger>
            <TabsTrigger value="selected" className="gap-2">
              Selected <span className="text-xs bg-success/20 px-1.5 rounded">{statusCounts.selected}</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              Rejected <span className="text-xs bg-destructive/20 px-1.5 rounded">{statusCounts.rejected}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {getFilteredApplications(activeTab).map((application, index) => {
                const config = statusConfig[application.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                
                return (
                  <Card
                    key={application.id}
                    className="animate-slide-up hover:shadow-card-hover transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                            {application.companies.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{application.companies.name}</h3>
                            <p className="text-muted-foreground text-sm">{application.companies.role}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied on {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-success">{application.companies.salary}</span>
                          <Badge className={config.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {getFilteredApplications(activeTab).length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? 'Start applying to companies!' : 'No applications in this category yet'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Applications;
