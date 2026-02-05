import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlacementStats } from '@/hooks/usePlacementStats';
import { useUsers } from '@/hooks/useUsers';
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
  const { data: users, isLoading: usersLoading } = useUsers();

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

  const pendingApplications = applications?.filter(a => a.status === 'pending' || a.status === 'under_review').length || 0;

  const students = (users || []).filter(u => u.role === 'student');
  const placedStudents = students.filter(s => s.isPlaced).length;
  const unplacedStudents = students.length - placedStudents;
  const averageGpa = students.length
    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome, {user?.name}! 
          </h1>
          <p className="text-muted-foreground">Manage campus placements and monitor student progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Students" value={statsLoading ? '-' : stats?.totalStudents || 0} icon={Users} />
          <StatsCard title="Placed Students" value={statsLoading ? '-' : stats?.placedStudents || 0} icon={UserCheck} variant="success" />
          <StatsCard title="Pending Applications" value={statsLoading ? '-' : pendingApplications} icon={UserX} variant="warning" />
          <StatsCard title="Active Companies" value={companies?.length || 0} icon={Building2} variant="primary" />
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Student Statistics</CardTitle>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold mt-1">{usersLoading ? '-' : students.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Placed</p>
                    <p className="text-3xl font-bold text-success mt-1">{usersLoading ? '-' : placedStudents}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <p className="text-sm text-muted-foreground">Unplaced</p>
                    <p className="text-3xl font-bold text-warning mt-1">{usersLoading ? '-' : unplacedStudents}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Average GPA</p>
                    <p className="text-3xl font-bold text-primary mt-1">{usersLoading ? '-' : averageGpa}</p>
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
                    <div key={company._id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg ring-2 ring-white">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">{company.roles?.[0] || 'Position'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">₹{company.salary || 'TBD'}</p>
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
