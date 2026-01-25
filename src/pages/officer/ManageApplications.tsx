import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useApplications, useUpdateApplication, Application } from '@/hooks/useApplications';
import { useUsers, useUpdateUser } from '@/hooks/useUsers';
import { CheckCircle, Clock, XCircle, Users, Send, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManageApplications = () => {
  const { toast } = useToast();
  const { data: applications = [] } = useApplications();
  const updateApplication = useUpdateApplication();
  const { data: users = [] } = useUsers();
  const updateUser = useUpdateUser();
  const [activeTab, setActiveTab] = useState('all');
  const [gpaEdits, setGpaEdits] = useState<Record<string, string>>({});

  const getFilteredApplications = (status: string): Application[] => {
    if (status === 'all') return applications;
    return applications.filter((app) => app.status === status);
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    const application = applications.find(app => app._id === applicationId);

    try {
      await updateApplication.mutateAsync({ id: applicationId, status: newStatus });

      if (newStatus === 'approved') {
        toast({
          title: '🎉 Application Approved',
          description: `${application?.studentId?.name || 'Student'} has been approved.`,
        });
      } else {
        toast({
          title: 'Status Updated',
          description: `Application status updated to ${newStatus}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Could not update status.',
        variant: 'destructive',
      });
    }
  };

  const handleGpaUpdate = async (studentId: string) => {
    const value = gpaEdits[studentId];
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 10) {
      toast({ title: 'Invalid GPA', description: 'Enter a value between 0 and 10.', variant: 'destructive' });
      return;
    }
    try {
      await updateUser.mutateAsync({ id: studentId, gpa: parsed });
      toast({ title: 'GPA Updated', description: 'Student GPA has been updated.' });
    } catch (error: any) {
      toast({ title: 'Update failed', description: error?.message || 'Could not update GPA.', variant: 'destructive' });
    }
  };

  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Send, label: 'Pending', color: 'bg-muted text-muted-foreground' };
      case 'under_review':
        return { icon: Clock, label: 'Under Review', color: 'bg-warning/10 text-warning' };
      case 'approved':
        return { icon: CheckCircle, label: 'Approved', color: 'bg-success/10 text-success' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', color: 'bg-destructive/10 text-destructive' };
    }
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    under_review: applications.filter((a) => a.status === 'under_review').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Application Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and update student application statuses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(['pending', 'under_review', 'approved', 'rejected'] as const).map((status, index) => {
            const config = getStatusConfig(status);
            const Icon = config.icon;
            return (
              <Card
                key={status}
                className="animate-slide-up rounded-2xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5 text-center">
                  <div className={`inline-flex p-3 rounded-xl mb-3 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold">{statusCounts[status]}</p>
                  <p className="text-sm text-muted-foreground capitalize">{status}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications Table */}
        <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-2 bg-muted/50 p-2 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="under_review" className="rounded-lg">Under Review ({statusCounts.under_review})</TabsTrigger>
                <TabsTrigger value="approved" className="rounded-lg">Approved ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg">Rejected ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredApplications(activeTab).map((application, index) => {
                const config = getStatusConfig(application.status);
                const Icon = config.icon;
                const student = users.find(u => u._id === application.studentId?._id);
                
                return (
                  <div
                    key={application._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                        {application.studentId?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{application.studentId?.name || 'Student'}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applied to <span className="font-medium text-foreground">{application.companyId?.name || 'Company'}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">GPA</span>
                        <Input
                          className="w-20"
                          value={gpaEdits[application.studentId._id] ?? (student?.gpa?.toString() || '')}
                          placeholder="0-10"
                          onChange={(e) => setGpaEdits({ ...gpaEdits, [application.studentId._id]: e.target.value })}
                        />
                        <Button size="sm" variant="outline" onClick={() => handleGpaUpdate(application.studentId._id)}>
                          Save
                        </Button>
                      </div>

                      <Badge className={`gap-1.5 ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </Badge>

                      <Select
                        value={application.status}
                        onValueChange={(value: Application['status']) =>
                          handleStatusChange(application._id, value)
                        }
                        
                      >
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}

              {getFilteredApplications(activeTab).length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground">
                    No applications in this category
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageApplications;
