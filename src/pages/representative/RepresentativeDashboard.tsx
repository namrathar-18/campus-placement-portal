import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, Building2, TrendingUp, AlertCircle, BriefcaseBusiness, ArrowRight, Bell } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  totalApplications: number;
  pendingApplications: number;
  placedApplications: number;
  activeCompanies: number;
  recentNotifications: any[];
}

const RepresentativeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/representative/dashboard-stats');
      setStats(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const placementPercentage = useMemo(() => {
    if (!stats?.totalStudents) return 0;
    return Number(((stats.placedStudents / stats.totalStudents) * 100).toFixed(1));
  }, [stats]);

  const applicationConversion = useMemo(() => {
    if (!stats?.totalApplications) return 0;
    return Number(((stats.placedApplications / stats.totalApplications) * 100).toFixed(1));
  }, [stats]);

  const placementProgressWidth = `${Math.min(100, Math.max(0, placementPercentage))}%`;
  const conversionProgressWidth = `${Math.min(100, Math.max(0, applicationConversion))}%`;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Student Representative Dashboard</h1>
        <p className="text-muted-foreground">
          Department-level placement command center for tracking students, applications, and immediate follow-ups.
        </p>
      </div>

      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/10 via-background to-success/10">
        <CardContent className="py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Representative Focus</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">What this dashboard helps you do</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor placement health of your department, identify pending student actions, and coordinate faster with the placement cell.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">{stats?.totalStudents || 0} students</Badge>
              <Badge variant="secondary" className="bg-success/10 text-success">{placementPercentage}% placement rate</Badge>
              <Badge variant="secondary" className="bg-warning/10 text-warning">{stats?.pendingApplications || 0} pending applications</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your department
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placed Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.placedStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {placementPercentage}% placement rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingApplications || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need review or follow-up
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.activeCompanies || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently hiring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Application Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Applications</span>
                <span className="font-semibold">{stats?.totalApplications || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Placed</span>
                <span className="font-semibold text-green-600">
                  {stats?.placedApplications || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.pendingApplications || 0}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Application-to-placement conversion</p>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-success" style={{ width: conversionProgressWidth }} />
                </div>
                <p className="text-xs font-semibold mt-1 text-success">{applicationConversion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Placement Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Placed</span>
                <span className="font-semibold text-green-600">
                  {stats?.placedStudents || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unplaced</span>
                <span className="font-semibold text-orange-600">
                  {stats?.unplacedStudents || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-semibold">{placementPercentage}%</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Department placement progress</p>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: placementProgressWidth }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.pendingApplications && stats.pendingApplications > 0 ? (
                <p className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  {stats.pendingApplications} applications pending review
                </p>
              ) : null}
              {stats?.unplacedStudents && stats.unplacedStudents > 0 ? (
                <p className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {stats.unplacedStudents} students need placement support
                </p>
              ) : null}
              {!stats?.pendingApplications && !stats?.unplacedStudents && (
                <p className="text-sm text-muted-foreground">
                  No urgent actions right now.
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Link to="/representative/applications">
                  <Button variant="outline" className="w-full justify-between">Review Applications <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link to="/representative/companies">
                  <Button variant="outline" className="w-full justify-between">View Companies <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link to="/representative/notifications">
                  <Button variant="outline" className="w-full justify-between">Manage Notifications <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {stats?.recentNotifications && stats.recentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RepresentativeDashboard;
