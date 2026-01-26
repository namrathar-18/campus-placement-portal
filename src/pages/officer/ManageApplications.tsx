import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useApplications, useUpdateApplication, Application } from '@/hooks/useApplications';
import { CheckCircle, Clock, XCircle, Send, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManageApplications = () => {
  const { toast } = useToast();
  const { data: applications = [] } = useApplications();
  const updateApplication = useUpdateApplication();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState<'all' | 'placed' | 'unplaced'>('all');

  const isStudentPlaced = (studentId: string): boolean => {
    return applications.some(
      app => app.studentId?._id === studentId && app.status === 'approved'
    );
  };

  const matchesSearch = (app: Application) => {
    const haystack = `
      ${app.studentId?.name || ''}
      ${app.studentId?.registerNumber || ''}
      ${app.studentId?.department || ''}
      ${(app.studentId as any)?.section || ''}
      ${app.companyId?.name || ''}
    `.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase().trim());
  };

  const matchesDepartment = (app: Application) => {
    if (departmentFilter === 'all') return true;
    return (app.studentId?.department || '').toLowerCase() === departmentFilter.toLowerCase();
  };

  const matchesPlacement = (app: Application) => {
    if (placementFilter === 'all') return true;
    const placed = isStudentPlaced(app.studentId?._id || '');
    return placementFilter === 'placed' ? placed : !placed;
  };

  const getFilteredApplications = (status: string): Application[] => {
    let filtered = applications.filter((app) => matchesSearch(app) && matchesDepartment(app) && matchesPlacement(app));

    if (status !== 'all') {
      filtered = filtered.filter((app) => app.status === status);
      if (status === 'rejected') {
        filtered = filtered.filter(app => !isStudentPlaced(app.studentId?._id || ''));
      }
    }

    return filtered;
  };

  // Group applications by student
  const groupApplicationsByStudent = (apps: Application[]) => {
    const grouped = apps.reduce((acc, app) => {
      const studentId = app.studentId?._id;
      if (!studentId) return acc;
      
      if (!acc[studentId]) {
        acc[studentId] = {
          student: app.studentId,
          applications: []
        };
      }
      acc[studentId].applications.push(app);
      return acc;
    }, {} as Record<string, { student: any; applications: Application[] }>);
    
    return Object.values(grouped);
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

  // Count unique students by status
  const getUniqueStudentCount = (status: Application['status']) => {
    let filtered = applications.filter(a => a.status === status);
    
    // Exclude placed students from rejected count
    if (status === 'rejected') {
      filtered = filtered.filter(a => !isStudentPlaced(a.studentId?._id || ''));
    }
    
    return new Set(
      filtered
        .map(a => a.studentId?._id)
        .filter(Boolean)
    ).size;
  };

  const statusCounts = {
    all: groupApplicationsByStudent(applications).length,
    approved: getUniqueStudentCount('approved'),
    rejected: getUniqueStudentCount('rejected'),
  };

  const departmentOptions = Array.from(
    new Set(
      applications
        .map(app => app.studentId?.department)
        .filter(Boolean)
    )
  );

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

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by student, register, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept || 'unknown'}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={placementFilter} onValueChange={(value: 'all' | 'placed' | 'unplaced') => setPlacementFilter(value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="placed">Placed Only</SelectItem>
              <SelectItem value="unplaced">Unplaced Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
          {(['approved', 'rejected'] as const).map((status, index) => {
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
                <TabsTrigger value="approved" className="rounded-lg">Approved ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg">Rejected ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {groupApplicationsByStudent(getFilteredApplications(activeTab)).map((group, groupIndex) => {
                const studentPlaced = isStudentPlaced(group.student._id);
                
                return (
                  <div
                    key={group.student._id}
                    className="p-6 rounded-2xl bg-muted/20 border border-border/50 animate-slide-up"
                    style={{ animationDelay: `${groupIndex * 50}ms` }}
                  >
                    {/* Student Header */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/50">
                      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                        {group.student.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{group.student.name || 'Student'}</h3>
                          {studentPlaced && (
                            <Badge className="bg-success/10 text-success border-success/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Placed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {group.student.email} • {group.student.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {group.applications.length} {group.applications.length === 1 ? 'Application' : 'Applications'}
                        </p>
                      </div>
                    </div>

                    {/* Applications List */}
                    <div className="space-y-3">
                      {group.applications.map((application, appIndex) => {
                        const config = getStatusConfig(application.status);
                        const isPlacedElsewhere = studentPlaced && application.status !== 'approved';
                        const displayStatus = isPlacedElsewhere
                          ? { icon: CheckCircle, label: 'Already Placed', color: 'bg-success/10 text-success' }
                          : config;
                        const Icon = displayStatus.icon;
                        
                        return (
                          <div
                            key={application._id}
                            className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {application.companyId?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h4 className="font-medium">{application.companyId?.name || 'Company'}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Applied: {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge className={`gap-1.5 ${displayStatus.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                                {displayStatus.label}
                              </Badge>

                              {isPlacedElsewhere ? (
                                <div className="px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
                                  Already placed
                                </div>
                              ) : (
                                <>
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
                                </>
                              )}
                              {isPlacedElsewhere && (
                                <span className="text-xs text-muted-foreground italic">Already placed with another company</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
