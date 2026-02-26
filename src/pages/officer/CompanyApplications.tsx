import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApplications, useUpdateApplication, Application } from '@/hooks/useApplications';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, XCircle, Send, FileText, ArrowLeft, Loader2 } from 'lucide-react';

const CompanyApplications = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: applications = [] } = useApplications();
  const updateApplication = useUpdateApplication();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Send, label: 'Pending', color: 'bg-muted text-muted-foreground' };
      case 'ongoing':
        return { icon: Clock, label: 'Ongoing', color: 'bg-warning/10 text-warning' };
      case 'placed':
        return { icon: CheckCircle, label: 'Placed', color: 'bg-success/10 text-success' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', color: 'bg-destructive/10 text-destructive' };
    }
  };

  const companyApplications = useMemo(() => {
    return applications.filter(
      (app) => app.companyId?._id === companyId
    );
  }, [applications, companyId]);

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    setUpdatingId(applicationId);
    try {
      await updateApplication.mutateAsync({ id: applicationId, status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const companyName = companyApplications[0]?.companyId?.name || 'Company';
  const pendingTotal = companyApplications.filter((a) => a.status === 'pending').length;
  const reviewTotal = companyApplications.filter((a) => a.status === 'ongoing').length;
  const placedTotal = companyApplications.filter((a) => a.status === 'placed').length;
  const rejectedTotal = companyApplications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button + Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate('/officer/applications')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg ring-2 ring-white">
              {companyName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {companyName}
              </h1>
              <p className="text-muted-foreground">
                {companyApplications.length} application{companyApplications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {([
            { status: 'pending' as const, count: pendingTotal },
            { status: 'ongoing' as const, count: reviewTotal },
            { status: 'placed' as const, count: placedTotal },
            { status: 'rejected' as const, count: rejectedTotal },
          ]).map(({ status, count }, index) => {
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
                  <p className="text-3xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications List */}
        <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyApplications.map((application) => {
                const config = getStatusConfig(application.status);
                const Icon = config.icon;

                return (
                  <div
                    key={application._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border animate-slide-up"
                  >
                    <div>
                      <p className="font-semibold text-base">{application.studentId?.name || 'Student'}</p>
                      <p className="text-sm text-muted-foreground">
                        Register No: {application.studentId?.registerNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Department: {application.studentId?.department || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Applied on{' '}
                        {application.appliedDate
                          ? new Date(application.appliedDate).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {updatingId === application._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : null}
                      <Select
                        value={application.status}
                        onValueChange={(value: Application['status']) =>
                          handleStatusChange(application._id, value)
                        }
                        disabled={updatingId === application._id}
                      >
                        <SelectTrigger className={`w-[160px] gap-1.5 ${config.color} border-0 font-medium`}>
                          <Icon className="w-3.5 h-3.5" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="placed">Placed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}

              {companyApplications.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground">
                    No applications for this company yet
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

export default CompanyApplications;
