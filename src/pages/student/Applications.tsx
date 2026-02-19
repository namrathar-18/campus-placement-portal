import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApplications, Application } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Loader2, Building2, Clock, CheckCircle, XCircle, Users, Award } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-accent/10 text-accent', icon: Users },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  already_placed: { label: 'Already Placed', color: 'bg-primary/10 text-primary', icon: Award },
};

const Applications = () => {
  const { data: applications, isLoading } = useApplications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Helper to determine if application should show 'Already Placed'
  const getDisplayStatus = (app: Application) => {
    if (user?.isPlaced && app.status !== 'approved') {
      return 'already_placed';
    }
    return app.status;
  };

  const getFilteredApplications = (status: string): Application[] => {
    if (!applications) return [];
    // Filter out applications with null/missing companyId and those that should show 'already_placed'
    const validApplications = applications.filter(app => {
      if (!app.companyId || !app.companyId.name) return false;
      // Don't show non-approved applications if user is already placed
      if (user?.isPlaced && app.status !== 'approved') return false;
      return true;
    });
    if (status === 'all') return validApplications;
    return validApplications.filter((app) => app.status === status);
  };

  const statusCounts = {
    all: applications?.filter(app => {
      if (!app.companyId || !app.companyId.name) return false;
      if (user?.isPlaced && app.status !== 'approved') return false;
      return true;
    }).length || 0,
    pending: applications?.filter((a) => a.status === 'pending' && !user?.isPlaced && a.companyId && a.companyId.name).length || 0,
    under_review: applications?.filter((a) => a.status === 'under_review' && !user?.isPlaced && a.companyId && a.companyId.name).length || 0,
    approved: applications?.filter((a) => a.status === 'approved' && a.companyId && a.companyId.name).length || 0,
    rejected: applications?.filter((a) => a.status === 'rejected' && !user?.isPlaced && a.companyId && a.companyId.name).length || 0,
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
            <TabsTrigger value="pending" className="gap-2">
              Pending <span className="text-xs bg-muted px-1.5 rounded">{statusCounts.pending}</span>
            </TabsTrigger>
            <TabsTrigger value="under_review" className="gap-2">
              Under Review <span className="text-xs bg-accent/20 px-1.5 rounded">{statusCounts.under_review}</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              Approved <span className="text-xs bg-success/20 px-1.5 rounded">{statusCounts.approved}</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              Rejected <span className="text-xs bg-destructive/20 px-1.5 rounded">{statusCounts.rejected}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {getFilteredApplications(activeTab).map((application, index) => {
                const displayStatus = getDisplayStatus(application);
                const config = statusConfig[displayStatus as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                
                // Skip if company data is missing
                if (!application.companyId || !application.companyId.name) {
                  return null;
                }
                
                return (
                  <Card
                    key={application._id}
                    className="animate-slide-up hover:shadow-card-hover transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg ring-2 ring-white">
                            {application.companyId.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{application.companyId.name}</h3>
                            <p className="text-muted-foreground text-sm">{application.companyId.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied on {new Date(application.appliedDate || application.createdAt || '').toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {application.companyId.package && (
                            <span className="font-medium text-success">
                              ₹{application.companyId.package.toLocaleString('en-IN')}
                            </span>
                          )}
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
