import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlacementStats } from '@/hooks/usePlacementStats';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatsCard from '@/components/cards/StatsCard';
import { Building2, Users, UserCheck, UserX, Plus, ArrowRight, Clock, Loader2, Mail, Phone } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const OfficerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: companies } = useCompanies();
  const { data: applications } = useApplications();
  const { data: stats, isLoading: statsLoading } = usePlacementStats();
  const { data: notifications } = useNotifications();
  const { data: users, isLoading: usersLoading } = useUsers();
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [dialogView, setDialogView] = useState<'all' | 'placed' | 'unplaced'>('all');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'placement_officer') {
    return <Navigate to='/login' replace />;
  }

  const students = (users || []).filter(u => u.role === 'student');
  const placedStudents = students.filter(s => s.isPlaced).length;
  const unplacedStudents = students.length - placedStudents;
  const averageGpa = students.length
    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  const placedStudentList = students.filter(s => s.isPlaced);
  const unplacedStudentList = students.filter(s => !s.isPlaced);
  const getPlacementCompany = (studentId: string) => {
    const app = applications?.find(
      a => a.studentId?._id === studentId && a.status === 'approved'
    );
    return app?.companyId?.name || 'Placed';
  };

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
          <div onClick={() => { setDialogView('all'); setShowStudentsDialog(true); }} className="cursor-pointer">
            <StatsCard title="Total Students" value={statsLoading ? '-' : stats?.totalStudents || 0} icon={Users} />
          </div>
          <div onClick={() => { setDialogView('unplaced'); setShowStudentsDialog(true); }} className="cursor-pointer">
            <StatsCard title="Unplaced Students" value={statsLoading ? '-' : unplacedStudents} icon={UserX} variant="warning" />
          </div>
          <div onClick={() => { setDialogView('placed'); setShowStudentsDialog(true); }} className="cursor-pointer">
            <StatsCard title="Placed Students" value={statsLoading ? '-' : stats?.placedStudents || 0} icon={UserCheck} variant="success" />
          </div>
          <StatsCard title="Active Companies" value={companies?.length || 0} icon={Building2} variant="primary" />
        </div>

        <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogView === 'all' && `Total Students (${students.length})`}
                {dialogView === 'placed' && `Placed Students (${placedStudentList.length})`}
                {dialogView === 'unplaced' && `Unplaced Students (${unplacedStudentList.length})`}
              </DialogTitle>
            </DialogHeader>

            {dialogView === 'all' && (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={`all-${student._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {student.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Section {student.section || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{student.registerNumber || 'Reg #'}</Badge>
                  </div>
                ))}
              </div>
            )}

            {dialogView === 'placed' && (
              <div className="space-y-2">
                {placedStudentList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No placed students yet.</p>
                ) : (
                  placedStudentList.map((student) => (
                    <div
                      key={`placed-${student._id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold">
                          {student.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Section {student.section || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-success">{getPlacementCompany(student._id)}</p>
                        <p className="text-xs text-muted-foreground">Placed company</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {dialogView === 'unplaced' && (
              <div className="space-y-2">
                {unplacedStudentList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Everyone is placed. 🎉</p>
                ) : (
                  unplacedStudentList.map((student) => (
                    <div
                      key={`unplaced-${student._id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                          {student.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Section {student.section || 'N/A'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{student.registerNumber || 'Reg #'}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid lg:grid-cols-1 gap-8">
          <div className="space-y-6">
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
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">{company.name.charAt(0)}</div>
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
