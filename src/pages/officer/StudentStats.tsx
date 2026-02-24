import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Users, UserCheck, UserX, GraduationCap, TrendingUp, FileText, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const StudentStats = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: applications } = useApplications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'placed' | 'unplaced'>('placed');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'placement_officer' && user?.role !== 'student_representative')) {
    return <Navigate to="/login" replace />;
  }

  const students = (users || []).filter(u => u.role === 'student');
  const placedStudents = students.filter(s => s.isPlaced).length;
  const unplacedStudents = students.length - placedStudents;
  const averageGpa = students.length
    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  const pendingApplications = applications?.filter(a => a.status === 'pending' || a.status === 'under_review').length || 0;
  const approvedApplications = applications?.filter(a => a.status === 'approved').length || 0;
  const rejectedApplications = applications?.filter(a => a.status === 'rejected').length || 0;

  const placementRate = students.length
    ? ((placedStudents / students.length) * 100).toFixed(1)
    : '0.0';

  const filteredStudents = useMemo(() => {
    const list = activeTab === 'placed'
      ? students.filter(s => s.isPlaced)
      : students.filter(s => !s.isPlaced);

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      s =>
        s.name?.toLowerCase().includes(term) ||
        s.registerNumber?.toLowerCase().includes(term) ||
        s.department?.toLowerCase().includes(term) ||
        s.section?.toLowerCase().includes(term)
    );
  }, [students, activeTab, searchTerm]);

  const statCards = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-foreground', bg: 'bg-muted/50', border: '' },
    { label: 'Placed', value: placedStudents, icon: UserCheck, color: 'text-success', bg: 'bg-success/5', border: 'border-success/20' },
    { label: 'Unplaced', value: unplacedStudents, icon: UserX, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
    { label: 'Avg GPA', value: averageGpa, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/officer/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Student Statistics</h1>
              <p className="text-muted-foreground">Detailed overview of student placement data</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <Card key={card.label} className={`rounded-2xl ${card.bg} ${card.border ? `border ${card.border}` : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{i === 0 ? 'Total' : i === 3 ? 'Avg' : 'Count'}</Badge>
                </div>
                <p className={`text-3xl font-bold ${card.color}`}>{usersLoading ? '-' : card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placement Rate */}
        <Card className="rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="font-semibold text-sm">Placement Rate</span>
              </div>
              <span className="text-2xl font-bold text-success">{placementRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-success/80 to-success h-3 rounded-full transition-all duration-1000"
                style={{ width: `${placementRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{placedStudents} placed</span>
              <span>{unplacedStudents} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Application Breakdown */}
        <Card className="rounded-2xl mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Application Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/15">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{pendingApplications}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/15">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{approvedApplications}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/15">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{rejectedApplications}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Student Directory</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'placed' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5 rounded-lg"
                  onClick={() => setActiveTab('placed')}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Placed
                  <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">{placedStudents}</Badge>
                </Button>
                <Button
                  variant={activeTab === 'unplaced' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5 rounded-lg"
                  onClick={() => setActiveTab('unplaced')}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Unplaced
                  <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">{unplacedStudents}</Badge>
                </Button>
              </div>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, register number, department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map(student => (
                <div
                  key={student._id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    activeTab === 'placed'
                      ? 'bg-success/5 border-success/10 hover:bg-success/10'
                      : 'bg-warning/5 border-warning/10 hover:bg-warning/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      activeTab === 'placed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {student.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.registerNumber || 'N/A'} · {student.department || 'N/A'} · Sec {student.section || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {activeTab === 'placed' ? (
                      <Badge className="bg-success/10 text-success border-0 text-xs">Placed</Badge>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">GPA: {student.gpa?.toFixed(2) || 'N/A'}</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-10">
                  <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No students match your search' : activeTab === 'placed' ? 'No placed students yet' : 'All students placed!'}
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

export default StudentStats;
