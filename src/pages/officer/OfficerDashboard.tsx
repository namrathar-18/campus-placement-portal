import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlacementStats } from '@/hooks/usePlacementStats';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectGroup, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Users, Plus, ArrowRight, Clock, Loader2, TrendingUp, BarChart2, Search, CheckCircle2, XCircle, Target, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import { exportPlacedApprovedStudentsPdf } from '@/lib/exportPlacedApprovedStudentsPdf';
import { useToast } from '@/hooks/use-toast';
import { SECTION_OPTIONS, type SectionOption, isSectionOption, normalizeSection } from '@/constants/sections';

const PIE_COLORS = [
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#be185d', '#4f46e5', '#15803d', '#ea580c',
  '#6d28d9', '#0284c7', '#b91c1c', '#0d9488', '#c026d3',
  '#ca8a04',
];

const SECTION_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'A', label: 'MCA A' },
  { value: 'B', label: 'MCA B' },
  { value: 'AI/ML', label: 'AI/ML' },
];

const getTreemapLabel = (name: string, width: number) => {
  if (!name) return '';
  const maxChars = Math.max(5, Math.floor((width - 14) / 7));
  return name.length > maxChars ? `${name.slice(0, maxChars - 1)}...` : name;
};

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index } = props;
  const color = PIE_COLORS[(index ?? 0) % PIE_COLORS.length];
  const showName = width > 58 && height > 28;
  const showValue = width > 54 && height > 42;
  const label = getTreemapLabel(name, width);
  const nameFontSize = Math.max(10, Math.min(14, Math.floor(width / 9)));
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={6} ry={6} stroke="hsl(var(--card))" strokeWidth={3} />
      {showName && (
        <>
          <text x={x + width / 2} y={y + height / 2 - (showValue ? 6 : 0)} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={nameFontSize} fontWeight={600} pointerEvents="none">{label}</text>
          {showValue && (
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.88)" fontSize={11} pointerEvents="none">{value}</text>
          )}
        </>
      )}
    </g>
  );
};

const OfficerDashboard = () => {
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: companies } = useCompanies();
  const { data: applications } = useApplications();
  const { data: stats, isLoading: statsLoading } = usePlacementStats();
  const { data: notifications } = useNotifications();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { toast } = useToast();

  const [sectionDialog, setSectionDialog] = useState<{ section: string; tab: 'all' | 'placed' | 'unplaced' | 'pending' } | null>(null);
  const [sectionSearch, setSectionSearch] = useState('');

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

  const pendingApplications = applications?.filter(a => a.status === 'pending' || a.status === 'ongoing').length || 0;

  const students = (users || []).filter(u =>
    u.role === 'student' &&
    u.registerNumber?.trim() &&
    u.department?.trim() &&
    u.section?.trim()
  );
  // Mark students as placed only if they have at least one application with status 'placed'
  const placedStudentIds = new Set(
    (applications || [])
      .filter(a => a.status === 'placed' && a.studentId?._id)
      .map(a => a.studentId._id)
  );
  const placedStudents = students.filter(s => placedStudentIds.has(s._id)).length;
  const unplacedStudents = students.length - placedStudents;
  const averageGpa = students.length
    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';
  const pendingStudentIds = useMemo(() => new Set(
    (applications || [])
      .filter(a => a.status === 'pending' || a.status === 'ongoing')
      .map(a => a.studentId?._id)
      .filter(Boolean)
  ), [applications]);

  const placedCompanyByStudent = useMemo(() => {
    const map = new Map<string, string>();
    for (const app of (applications || [])) {
      if (app.status === 'placed' && app.studentId?._id && !map.has(app.studentId._id)) {
        map.set(app.studentId._id, app.companyId?.name || 'Unknown');
      }
    }
    return map;
  }, [applications]);

  const sectionWiseAnalytics = useMemo(() => {
    const pendingStudentIds = new Set(
      (applications || [])
        .filter((application) => application.status === 'pending' || application.status === 'ongoing')
        .map((application) => application.studentId?._id)
        .filter(Boolean)
    );

    const groupedBySection = SECTION_OPTIONS.reduce<Record<SectionOption, { section: SectionOption; placed: number; unplaced: number; pending: number }>>(
      (acc, section) => {
        acc[section] = { section, placed: 0, unplaced: 0, pending: 0 };
        return acc;
      },
      {} as Record<SectionOption, { section: SectionOption; placed: number; unplaced: number; pending: number }>
    );

    students.reduce(
      (acc, student) => {
        const section = normalizeSection(student.section) as SectionOption;
        if (!isSectionOption(section)) return acc;

        if (placedStudentIds.has(student._id)) {
          acc[section].placed += 1;
        } else if (pendingStudentIds.has(student._id)) {
          acc[section].pending += 1;
        } else {
          acc[section].unplaced += 1;
        }

        return acc;
      },
      groupedBySection
    );

    return SECTION_OPTIONS.map((section) => groupedBySection[section]);
  }, [applications, students]);

  // The analytics graph should always show all three sections
  const filteredSectionAnalytics = sectionWiseAnalytics;

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
      .map((company) => ({
        name: company.name,
        value: company.studentIds.size,
      }))
      .filter((company) => company.value > 0 && company.name && company.name !== 'Unknown Company')
      .sort((a, b) => b.value - a.value);
  }, [applications]);
  const filteredCompanyAnalytics = useMemo(() => {
    if (!selectedCompany) return companyWisePlaced;
    return companyWisePlaced.filter(item => item.name === (companies?.find(c => c._id === selectedCompany)?.name || ''));
  }, [companyWisePlaced, selectedCompany, companies]);
  const roleWisePlaced = useMemo(() => {
    const companyById = new Map((companies || []).map((company) => [company._id, company]));
    const placedApplications = (applications || []).filter(
      (application) => application.status === 'placed' && application.companyId?._id
    );

    const roleMap = placedApplications.reduce<Record<string, Set<string>>>((acc, application) => {
      const company = companyById.get(application.companyId._id);
      const companyRoles = company?.roles?.length ? company.roles : ['Other'];
      const studentKey = application.studentId?._id || application._id;

      if (!studentKey) {
        return acc;
      }

      companyRoles.forEach((roleName) => {
        const role = (roleName || 'Other').trim() || 'Other';
        if (!acc[role]) {
          acc[role] = new Set<string>();
        }
        acc[role].add(studentKey);
      });

      return acc;
    }, {});

    const sorted = Object.entries(roleMap)
      .map(([role, studentIds]) => ({
        role,
        value: studentIds.size,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (sorted.length <= 6) return sorted;
    const top5 = sorted.slice(0, 5);
    const othersValue = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
    return [...top5, { role: 'Others', value: othersValue }];
  }, [applications, companies]);
  // Only export students with status 'placed'
  const placedStudentsList = useMemo(() => {
    // Collect student IDs who have at least one placed application
    const placedByApplicationIds = new Set(
      (applications || [])
        .filter((app) => app.status === 'placed')
        .map((app) => app.studentId?._id)
        .filter(Boolean)
    );

    return students
      .filter((student) => student.isPlaced || placedByApplicationIds.has(student._id))
      .map((student) => ({
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        section: student.section,
        gpa: student.gpa,
        isPlaced: true,
      }));
  }, [students, applications]);

  const downloadPlacedPdf = () => {
    if (placedStudentsList.length === 0) {
      toast({
        title: 'No data available',
        description: 'No placed students found to export.',
        variant: 'destructive',
      });
      return;
    }

    exportPlacedApprovedStudentsPdf(placedStudentsList, 'officer-placed-students');
    toast({
      title: 'PDF exported',
      description: `Downloaded ${placedStudentsList.length} students in PDF format.`,
    });
  };
  const genderWisePlaced = useMemo(() => {
    const groupedByGender = students.reduce<Record<string, number>>((acc, student) => {
      if (!student.isPlaced) {
        return acc;
      }

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground">Manage campus placements and monitor student progress</p>
        </div>

        {/* Dashboard main grid restored to PlacementAnalytics style */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Student Statistics</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Live</Badge>
                  <Button variant="outline" size="sm" onClick={downloadPlacedPdf}>
                    Download Placed Students PDF
                  </Button>
                  <Link to="/officer/students"><Button variant="ghost" size="sm" className="gap-1"><TrendingUp className="w-4 h-4" /> View Details <ArrowRight className="w-4 h-4" /></Button></Link>
                </div>
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

            <div className="grid grid-cols-1 gap-6">
              {/* ...existing code (other cards) ... */}
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Section-wise Placement Analytics</CardTitle>
                  <Badge variant="outline" className="text-xs">{sectionWiseAnalytics.length} Sections</Badge>
                </CardHeader>
                <CardContent>
                  {sectionWiseAnalytics.length > 0 ? (
                    <div className="h-72 cursor-pointer">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectionWiseAnalytics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="section" stroke="hsl(var(--muted-foreground))" />
                          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Legend />
                          <Bar dataKey="placed" name="Placed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="unplaced" name="Unplaced" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" name="Applications Pending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No section data available yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
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
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value} students`, 'Placed']}
                          />
                        </Treemap>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No placed student data by company yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Top Roles - Placed Students</CardTitle>
                  <Badge variant="outline" className="text-xs">{roleWisePlaced.length} Roles</Badge>
                </CardHeader>
                <CardContent>
                  {roleWisePlaced.length > 0 ? (
                    <div className="h-72">
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
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="value" name="Placed Students" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No role-wise placement data yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Gender-wise Placed Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {genderWisePlaced.length > 0 ? (
                    <div className="h-72">
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
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No gender-wise placement data yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Upcoming Company Drives</CardTitle>
                <Link to="/officer/companies"><Button variant="ghost" size="sm" className="gap-1">Manage <ArrowRight className="w-4 h-4" /></Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies
                    ?.filter(c => c.name && c.name !== 'Company' && c.name !== 'Unknown Company')
                    .slice(0, 4)
                    .map((company) => (
                      <div key={company._id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg ring-2 ring-white">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.roles?.[0] || company.role || 'Position'}</p>
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
      {/* Section Student List Dialog */}

      <Dialog open={!!sectionDialog} onOpenChange={open => { if (!open) { setSectionDialog(null); setSectionSearch(''); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Section {sectionDialog?.section} — Students</DialogTitle>
            <DialogDescription>
              {students.filter(s => normalizeSection(s.section) === sectionDialog?.section).length} total students in this section
            </DialogDescription>
          </DialogHeader>
          {sectionDialog && (() => {
            const sec = sectionDialog.section;
            const allInSection = students.filter(s => normalizeSection(s.section) === sec);
            const tabs: { key: 'all' | 'placed' | 'unplaced' | 'pending'; label: string }[] = [
              { key: 'all',      label: 'All' },
              { key: 'placed',   label: 'Placed' },
              { key: 'unplaced', label: 'Unplaced' },
              { key: 'pending',  label: 'Pending' },
            ];
            let list = allInSection;
            if (sectionDialog.tab === 'placed')   list = list.filter(s => s.isPlaced);
            if (sectionDialog.tab === 'unplaced') list = list.filter(s => !s.isPlaced && !pendingStudentIds.has(s._id));
            if (sectionDialog.tab === 'pending')  list = list.filter(s => pendingStudentIds.has(s._id));
            if (sectionSearch.trim()) {
              const term = sectionSearch.toLowerCase();
              list = list.filter(s => s.name?.toLowerCase().includes(term) || s.registerNumber?.toLowerCase().includes(term));
            }
            return (
              <div className="space-y-4 mt-2">
                <div className="flex gap-2 flex-wrap">
                  {tabs.map(t => {
                    const count =
                      t.key === 'all'      ? allInSection.length :
                      t.key === 'placed'   ? allInSection.filter(s => s.isPlaced).length :
                      t.key === 'unplaced' ? allInSection.filter(s => !s.isPlaced && !pendingStudentIds.has(s._id)).length :
                      allInSection.filter(s => pendingStudentIds.has(s._id)).length;
                    return (
                      <button key={t.key}
                        onClick={() => setSectionDialog({ ...sectionDialog, tab: t.key })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          sectionDialog.tab === t.key
                            ? t.key === 'placed'   ? 'bg-green-100 text-green-800 border-green-300'
                            : t.key === 'unplaced' ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : t.key === 'pending'  ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                        }`}>
                        {t.label} <span className="ml-1 opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name or register number..." value={sectionSearch} onChange={e => setSectionSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Register No.</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Placed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
                      ) : list.map((student, idx) => {
                        const isPlaced  = student.isPlaced;
                        const isPending = pendingStudentIds.has(student._id);
                        const company   = placedCompanyByStudent.get(student._id);
                        return (
                          <TableRow key={student._id}>
                            <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ isPlaced ? 'bg-success/10 text-success' : isPending ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                                  {student.name?.charAt(0) || '?'}
                                </div>
                                <span className="font-medium text-sm">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{student.registerNumber || '—'}</TableCell>
                            <TableCell>
                              <span className={`font-semibold text-sm ${(student.gpa || 0) >= 8 ? 'text-success' : (student.gpa || 0) >= 6 ? 'text-warning' : 'text-destructive'}`}>
                                {student.gpa?.toFixed(2) ?? '—'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {isPlaced ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><CheckCircle2 className="w-3.5 h-3.5" />Placed</span>
                              ) : isPending ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><Clock className="w-3.5 h-3.5" />Pending</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning"><XCircle className="w-3.5 h-3.5" />Unplaced</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{company ?? '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">Showing {list.length} students</p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OfficerDashboard;
