import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlacementStats } from '@/hooks/usePlacementStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/cards/StatsCard';
import { Building2, Users, UserCheck, UserX, Plus, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const OfficerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: companies } = useCompanies();
  const { data: applications } = useApplications();
  const { data: stats, isLoading: statsLoading } = usePlacementStats();
  const { data: notifications } = useNotifications();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'placement_officer') {
    return <Navigate to="/login" replace />;
  }

  const pendingApplications = applications?.filter(a => a.status === 'applied' || a.status === 'shortlisted').length || 0;
  const placementRate = stats?.totalStudents ? Math.round((stats.placedStudents / stats.totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome, {user?.name}! 📊
          </h1>
          <p className="text-muted-foreground">Manage campus placements and monitor student progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Students" value={statsLoading ? '-' : stats?.totalStudents || 0} icon={Users} />
          <StatsCard title="Placed Students" value={statsLoading ? '-' : stats?.placedStudents || 0} icon={UserCheck} variant="success" trend={`${placementRate}% placement rate`} trendUp />
          <StatsCard title="Unplaced Students" value={statsLoading ? '-' : stats?.unplacedStudents || 0} icon={UserX} variant="warning" />
          <StatsCard title="Active Companies" value={companies?.length || 0} icon={Building2} variant="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Link to="/officer/companies"><Button variant="hero" className="w-full justify-start gap-3"><Plus className="w-4 h-4" />Add New Company</Button></Link>
                <Link to="/officer/applications"><Button variant="outline" className="w-full justify-start gap-3"><Clock className="w-4 h-4" />Pending Applications ({pendingApplications})</Button></Link>
                <Link to="/officer/notifications"><Button variant="outline" className="w-full justify-start gap-3"><Plus className="w-4 h-4" />Create Announcement</Button></Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recently Placed</CardTitle>
                <Badge className="bg-success/10 text-success">{placedStudents?.length || 0} placed</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {placedStudents?.slice(0, 4).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center font-bold text-success">{student.name.charAt(0)}</div>
                      <p className="font-medium text-sm">{student.name}</p>
                    </div>
                  </div>
                ))}
                {!placedStudents?.length && <p className="text-muted-foreground text-center py-2">No placed students yet</p>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Yet to be Placed</CardTitle>
                <Badge className="bg-warning/10 text-warning">{unplacedStudents?.length || 0} pending</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {unplacedStudents?.slice(0, 3).map((student) => (
                  <div key={student.id} className="flex items-center p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center font-bold text-warning">{student.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.department || 'Student'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!unplacedStudents?.length && <p className="text-muted-foreground text-center py-2">All students placed!</p>}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Application Pipeline</CardTitle>
                <Link to="/officer/applications"><Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="w-4 h-4" /></Button></Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-muted/50 text-center">
                    <p className="text-3xl font-bold">{applications?.filter(a => a.status === 'applied').length || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Applied</p>
                  </div>
                  <div className="p-5 rounded-xl bg-accent/10 text-center">
                    <p className="text-3xl font-bold text-accent">{applications?.filter(a => a.status === 'shortlisted').length || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Shortlisted</p>
                  </div>
                  <div className="p-5 rounded-xl bg-warning/10 text-center">
                    <p className="text-3xl font-bold text-warning">{applications?.filter(a => a.status === 'interview').length || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Interview</p>
                  </div>
                  <div className="p-5 rounded-xl bg-success/10 text-center">
                    <p className="text-3xl font-bold text-success">{applications?.filter(a => a.status === 'selected').length || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Upcoming Company Drives</CardTitle>
                <Link to="/officer/companies"><Button variant="ghost" size="sm" className="gap-1">Manage <ArrowRight className="w-4 h-4" /></Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies?.slice(0, 4).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">{company.name.charAt(0)}</div>
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">{company.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">{company.salary}</p>
                        <p className="text-xs text-muted-foreground">Due: {new Date(company.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
