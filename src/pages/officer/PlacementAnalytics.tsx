import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';

const PIE_COLORS = [
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#be185d', '#4f46e5', '#15803d', '#ea580c',
  '#6d28d9', '#0284c7', '#b91c1c', '#0d9488', '#c026d3',
  '#ca8a04',
];

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index } = props;
  const color = PIE_COLORS[(index ?? 0) % PIE_COLORS.length];
  const showLabel = width > 45 && height > 30;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={6} ry={6} stroke="hsl(var(--card))" strokeWidth={3} />
      {showLabel && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={11}>{value}</text>
        </>
      )}
    </g>
  );
};

const PlacementAnalytics = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: companies } = useCompanies();
  const { data: applications } = useApplications();
  const { data: users } = useUsers();

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

  const sectionWiseAnalytics = useMemo(() => {
    const pendingStudentIds = new Set(
      (applications || [])
        .filter((application) => application.status === 'pending' || application.status === 'ongoing')
        .map((application) => application.studentId?._id)
        .filter(Boolean)
    );

    const groupedBySection = students.reduce<Record<string, { section: string; placed: number; unplaced: number; pending: number }>>(
      (acc, student) => {
        const section = (student.section || '').trim();
        if (!section) return acc;
        if (!acc[section]) {
          acc[section] = { section, placed: 0, unplaced: 0, pending: 0 };
        }
        if (student.isPlaced) {
          acc[section].placed += 1;
        } else if (pendingStudentIds.has(student._id)) {
          acc[section].pending += 1;
        } else {
          acc[section].unplaced += 1;
        }
        return acc;
      },
      {}
    );

    return Object.values(groupedBySection).sort((a, b) => a.section.localeCompare(b.section));
  }, [applications, students]);

  const companyWisePlaced = useMemo(() => {
    const placedApplications = (applications || []).filter(
      (application) => application.status === 'placed' && application.companyId?._id
    );

    const companyMap = placedApplications.reduce<Record<string, { name: string; studentIds: Set<string> }>>(
      (acc, application) => {
        const companyId = application.companyId._id;
        const companyName = application.companyId.name || 'Unknown Company';
        const studentKey = application.studentId?._id || application._id;
        if (!acc[companyId]) {
          acc[companyId] = { name: companyName, studentIds: new Set<string>() };
        }
        if (studentKey) {
          acc[companyId].studentIds.add(studentKey);
        }
        return acc;
      },
      {}
    );

    return Object.values(companyMap)
      .map((company) => ({ name: company.name, value: company.studentIds.size }))
      .filter((company) => company.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  const roleWisePlaced = useMemo(() => {
    const companyById = new Map((companies || []).map((company) => [company._id, company]));
    const placedApplications = (applications || []).filter(
      (application) => application.status === 'placed' && application.companyId?._id
    );

    const roleMap = placedApplications.reduce<Record<string, Set<string>>>((acc, application) => {
      const company = companyById.get(application.companyId._id);
      const companyRoles = company?.roles?.length ? company.roles : ['Other'];
      const studentKey = application.studentId?._id || application._id;
      if (!studentKey) return acc;

      companyRoles.forEach((roleName) => {
        const role = (roleName || 'Other').trim() || 'Other';
        if (!acc[role]) acc[role] = new Set<string>();
        acc[role].add(studentKey);
      });

      return acc;
    }, {});

    const sorted = Object.entries(roleMap)
      .map(([role, studentIds]) => ({ role, value: studentIds.size }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (sorted.length <= 6) return sorted;
    const top5 = sorted.slice(0, 5);
    const othersValue = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
    return [...top5, { role: 'Others', value: othersValue }];
  }, [applications, companies]);

  const genderWisePlaced = useMemo(() => {
    const groupedByGender = students.reduce<Record<string, number>>((acc, student) => {
      if (!student.isPlaced) return acc;
      const gender = (student.gender || '').trim().toLowerCase();
      if (gender === 'male' || gender === 'female') {
        const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
        acc[normalizedGender] = (acc[normalizedGender] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(groupedByGender)
      .map(([gender, value]) => ({ gender, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Link to="/officer/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Placement Analytics
          </h1>
          <p className="text-muted-foreground">Visual analytics for placement data across sections, companies, roles, and demographics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section-wise */}
          <Card className="rounded-2xl animate-slide-up" style={{ animationDelay: '0ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Section-wise Placement</CardTitle>
              <Badge variant="outline" className="text-xs">{sectionWiseAnalytics.length} Sections</Badge>
            </CardHeader>
            <CardContent>
              {sectionWiseAnalytics.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionWiseAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="section" stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Bar dataKey="placed" name="Placed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="unplaced" name="Unplaced" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Applications Pending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No section data available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Company-wise */}
          <Card className="rounded-2xl animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Company-wise Placed Students</CardTitle>
              <Badge variant="outline" className="text-xs">{companyWisePlaced.length} Companies</Badge>
            </CardHeader>
            <CardContent>
              {companyWisePlaced.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={companyWisePlaced}
                      dataKey="value"
                      nameKey="name"
                      stroke="hsl(var(--card))"
                      content={<TreemapContent />}
                    >
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`${value} students`, 'Placed']}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No placed student data by company yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Role-wise */}
          <Card className="rounded-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Roles - Placed Students</CardTitle>
              <Badge variant="outline" className="text-xs">{roleWisePlaced.length} Roles</Badge>
            </CardHeader>
            <CardContent>
              {roleWisePlaced.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleWisePlaced} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        type="category"
                        dataKey="role"
                        width={160}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" name="Placed Students" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No role-wise placement data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Gender-wise */}
          <Card className="rounded-2xl animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Gender-wise Placed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {genderWisePlaced.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderWisePlaced}
                        dataKey="value"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {genderWisePlaced.map((entry) => (
                          <Cell
                            key={entry.gender}
                            fill={entry.gender === 'Male' ? 'hsl(210 80% 55%)' : 'hsl(340 75% 55%)'}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No gender-wise placement data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlacementAnalytics;
