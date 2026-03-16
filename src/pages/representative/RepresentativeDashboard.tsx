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
        {/* Removed dashboard summary info box for cleaner UI */}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* ...existing code for stats cards... */}
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* ...existing code for additional stats row... */}
        </div>
      </Card>

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
