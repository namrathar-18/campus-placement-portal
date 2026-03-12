import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useApplications } from '@/hooks/useApplications';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
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
import { Loader2, Search, ArrowLeft, User, Building2, GraduationCap, Phone, Mail, Hash, BookOpen, Award, Star, Calendar, CheckCircle2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { normalizeSection } from '@/constants/sections';

const PlacedStudents = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: applications } = useApplications();
  const { data: companies } = useCompanies();

  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'A' | 'B' | 'AI/ML'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

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

  const placedStudents = useMemo(() =>
    (users || []).filter(u =>
      u.role === 'student' &&
      u.isPlaced &&
      u.registerNumber?.trim() &&
      u.department?.trim() &&
      u.section?.trim()
    ),
  [users]);

  // Map studentId → placed application (with company info)
  const placedAppByStudent = useMemo(() => {
    const map = new Map<string, any>();
    for (const app of (applications || [])) {
      if (app.status === 'placed' && app.studentId?._id && !map.has(app.studentId._id)) {
        map.set(app.studentId._id, app);
      }
    }
    return map;
  }, [applications]);

  const companyById = useMemo(() =>
    new Map((companies || []).map(c => [c._id, c])),
  [companies]);

  const filteredStudents = useMemo(() => {
    let list = placedStudents;
    if (sectionFilter !== 'all') list = list.filter(s => normalizeSection(s.section) === sectionFilter);
    if (genderFilter !== 'all') list = list.filter(s => (s.gender || '').toLowerCase() === genderFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.registerNumber?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [placedStudents, sectionFilter, genderFilter, searchTerm]);

  const sectionCounts = useMemo(() => ({
    A: placedStudents.filter(s => normalizeSection(s.section) === 'A').length,
    B: placedStudents.filter(s => normalizeSection(s.section) === 'B').length,
    'AI/ML': placedStudents.filter(s => normalizeSection(s.section) === 'AI/ML').length,
  }), [placedStudents]);

  const genderCounts = useMemo(() => ({
    male: placedStudents.filter(s => (s.gender || '').toLowerCase() === 'male').length,
    female: placedStudents.filter(s => (s.gender || '').toLowerCase() === 'female').length,
  }), [placedStudents]);

  const getApp = (studentId: string) => placedAppByStudent.get(studentId);
  const getCompany = (app: any) => app?.companyId?._id ? companyById.get(app.companyId._id) ?? app.companyId : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link to="/officer/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Placed Students</h1>
              <p className="text-muted-foreground">Full profiles of all successfully placed students</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-success">{placedStudents.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Placed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, register no. or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium mr-1">Section:</span>
            {([
              { key: 'all', label: 'All', count: placedStudents.length },
              { key: 'A', label: 'Sec A', count: sectionCounts.A },
              { key: 'B', label: 'Sec B', count: sectionCounts.B },
              { key: 'AI/ML', label: 'AI/ML', count: sectionCounts['AI/ML'] },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setSectionFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  sectionFilter === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                }`}
              >
                {label} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium mr-1">Gender:</span>
            {([
              { key: 'all', label: 'All', count: placedStudents.length },
              { key: 'male', label: 'Male', count: genderCounts.male },
              { key: 'female', label: 'Female', count: genderCounts.female },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setGenderFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  genderFilter === key
                    ? key === 'male'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : key === 'female'
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                }`}
              >
                {label} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {usersLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-muted-foreground font-normal">
                Showing {filteredStudents.length} placed student{filteredStudents.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="pl-6">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Register No.</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Placed On</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          No placed students found
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.map((student, idx) => {
                      const app = getApp(student._id);
                      const company = getCompany(app);
                      return (
                        <TableRow
                          key={student._id}
                          className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <TableCell className="pl-6 text-muted-foreground text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm font-bold shrink-0">
                                {student.name?.charAt(0) || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{student.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{student.registerNumber || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{student.section || '—'}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold text-sm ${
                              (student.gpa || 0) >= 8 ? 'text-success' :
                              (student.gpa || 0) >= 6 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {student.gpa?.toFixed(2) ?? '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium ${
                              student.gender?.toLowerCase() === 'male' ? 'text-blue-600' : 'text-pink-600'
                            }`}>
                              {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{company?.name || '—'}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {app?.updatedAt ? new Date(app.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:text-primary"
                              onClick={e => { e.stopPropagation(); setSelectedStudent(student); }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={open => { if (!open) setSelectedStudent(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (() => {
            const app = getApp(selectedStudent._id);
            const company = getCompany(app);
            const genderColor = selectedStudent.gender?.toLowerCase() === 'male'
              ? { bg: 'hsl(210 80% 92%)', text: 'hsl(210 80% 35%)' }
              : { bg: 'hsl(340 75% 92%)', text: 'hsl(340 75% 35%)' };

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4 pt-2">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                      style={{ background: genderColor.bg, color: genderColor.text }}
                    >
                      {selectedStudent.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedStudent.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className="bg-success/10 text-success border-success/20 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Placed
                        </Badge>
                        <Badge variant="outline" className="text-xs">{selectedStudent.section}</Badge>
                        {selectedStudent.gender && (
                          <Badge variant="outline" className="text-xs" style={{ color: genderColor.text, borderColor: genderColor.text }}>
                            {selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  {/* Placement Info */}
                  {company && (
                    <div className="rounded-xl border bg-success/5 border-success/20 p-4">
                      <h3 className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4" /> Placement Details
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="text-sm font-semibold mt-0.5">{company.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Package</p>
                          <p className="text-sm font-bold text-success mt-0.5">
                            {company.package ? `₹${company.package} LPA` : '—'}
                          </p>
                        </div>
                        {company.roles?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Role(s)</p>
                            <p className="text-sm font-medium mt-0.5">{company.roles.join(', ')}</p>
                          </div>
                        )}
                        {company.location && (
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium mt-0.5">{company.location}</p>
                          </div>
                        )}
                        {company.industry && (
                          <div>
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm font-medium mt-0.5">{company.industry}</p>
                          </div>
                        )}
                        {company.job_type && (
                          <div>
                            <p className="text-xs text-muted-foreground">Job Type</p>
                            <p className="text-sm font-medium mt-0.5 capitalize">{company.job_type}</p>
                          </div>
                        )}
                        {app?.updatedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Placed On</p>
                            <p className="text-sm font-medium mt-0.5">
                              {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                        {app?.appliedDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Applied On</p>
                            <p className="text-sm font-medium mt-0.5">
                              {new Date(app.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personal Info */}
                  <div className="rounded-xl border p-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <User className="w-4 h-4" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                        <p className="text-sm font-medium mt-0.5 break-all">{selectedStudent.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                        <p className="text-sm font-medium mt-0.5">{selectedStudent.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> Register No.</p>
                        <p className="text-sm font-mono font-medium mt-0.5">{selectedStudent.registerNumber || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm font-medium mt-0.5">
                          {selectedStudent.gender ? selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="rounded-xl border p-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4" /> Academic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> Department</p>
                        <p className="text-sm font-medium mt-0.5">{selectedStudent.department || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Section</p>
                        <p className="text-sm font-medium mt-0.5">{selectedStudent.section || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3" /> GPA</p>
                        <p className={`text-lg font-bold mt-0.5 ${
                          (selectedStudent.gpa || 0) >= 8 ? 'text-success' :
                          (selectedStudent.gpa || 0) >= 6 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {selectedStudent.gpa?.toFixed(2) ?? '—'} <span className="text-xs text-muted-foreground font-normal">/ 10</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedStudent.skills?.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4" /> Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedStudent.certifications?.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h3 className="text-sm font-semibold mb-3">Certifications</h3>
                      <ul className="space-y-1.5">
                        {selectedStudent.certifications.map((cert: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedStudent.projects?.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h3 className="text-sm font-semibold mb-3">Projects</h3>
                      <ul className="space-y-1.5">
                        {selectedStudent.projects.map((proj: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                            {proj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlacedStudents;
