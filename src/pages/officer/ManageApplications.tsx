import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApplications, Application } from '@/hooks/useApplications';
import { CheckCircle, Clock, XCircle, Send, FileText, ChevronRight, Search } from 'lucide-react';

const ManageApplications = () => {
  const navigate = useNavigate();
  const { data: applications = [] } = useApplications();
  const [searchTerm, setSearchTerm] = useState('');

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

  const formatStatusLabel = (value: string) =>
    value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const getUniqueStudentCount = (status?: Application['status']) => {
    const studentIds = new Set(
      applications
        .filter((application) => (status ? application.status === status : true))
        .map((application) => application.studentId?._id)
        .filter(Boolean)
    );

    return studentIds.size;
  };

  const statusCounts = {
    all: getUniqueStudentCount(),
    pending: getUniqueStudentCount('pending'),
    under_review: getUniqueStudentCount('under_review'),
    approved: getUniqueStudentCount('approved'),
    rejected: getUniqueStudentCount('rejected'),
  };

  const groupedByCompany = useMemo(() => {
    const grouped = applications.reduce<Record<string, Application[]>>((acc, application) => {
      const companyId = application.companyId?._id || application._id;
      if (!acc[companyId]) {
        acc[companyId] = [];
      }
      acc[companyId].push(application);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      const companyA = a[0]?.companyId?.name || '';
      const companyB = b[0]?.companyId?.name || '';
      return companyA.localeCompare(companyB);
    });
  }, [applications]);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return groupedByCompany;
    return groupedByCompany.filter((companyApps) => {
      const name = companyApps[0]?.companyId?.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [groupedByCompany, searchTerm]);

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
                  <p className="text-sm text-muted-foreground">{formatStatusLabel(status)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Company Cards */}
        <Card className="animate-slide-up rounded-2xl" style={{ animationDelay: '250ms' }}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Company Application Tracking</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((companyApplications, index) => {
                const firstApplication = companyApplications[0];
                const companyId = firstApplication.companyId?._id || firstApplication._id;
                const applicationTotal = companyApplications.length;
                const pendingTotal = companyApplications.filter((application) => application.status === 'pending').length;
                const reviewTotal = companyApplications.filter((application) => application.status === 'under_review').length;
                const approvedTotal = companyApplications.filter((application) => application.status === 'approved').length;
                const rejectedTotal = companyApplications.filter((application) => application.status === 'rejected').length;

                return (
                  <div
                    key={companyId}
                    className="rounded-xl border bg-muted/20 animate-slide-up p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/officer/applications/${companyId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg ring-2 ring-white">
                          {firstApplication.companyId?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{firstApplication.companyId?.name || 'Company'}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {applicationTotal} application{applicationTotal !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Pending: {pendingTotal}</Badge>
                      <Badge variant="outline" className="text-xs">Under Review: {reviewTotal}</Badge>
                      <Badge variant="outline" className="text-xs">Approved: {approvedTotal}</Badge>
                      <Badge variant="outline" className="text-xs">Rejected: {rejectedTotal}</Badge>
                    </div>
                  </div>
                );
              })}

              {filteredCompanies.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {searchTerm ? 'No matching companies' : 'No applications found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? `No companies match "${searchTerm}"` : 'No applications in this category'}
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
