import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApplications, Application } from '@/hooks/useApplications';
import { CheckCircle, Clock, XCircle, Send, FileText, ArrowLeft } from 'lucide-react';

const CompanyApplications = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: applications = [] } = useApplications();

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

  const companyApplications = useMemo(() => {
    return applications.filter(
      (app) => app.companyId?._id === companyId
    );
  }, [applications, companyId]);

  const companyName = companyApplications[0]?.companyId?.name || 'Company';
  const pendingTotal = companyApplications.filter((a) => a.status === 'pending').length;
  const reviewTotal = companyApplications.filter((a) => a.status === 'under_review').length;
  const approvedTotal = companyApplications.filter((a) => a.status === 'approved').length;
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
            { status: 'under_review' as const, count: reviewTotal },
            { status: 'approved' as const, count: approvedTotal },
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

                    <Badge className={`gap-1.5 ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </Badge>
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
