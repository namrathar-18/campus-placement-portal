import { useState, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { useUsers, BasicUser } from '@/hooks/useUsers';

import { useApplications, Application } from '@/hooks/useApplications';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import {

  Loader2, ArrowLeft, Users, UserCheck, UserX, GraduationCap,

  TrendingUp, FileText, Clock, CheckCircle2, XCircle, Search,

  Mail, Phone, Building2, ChevronRight, BookOpen, ExternalLink, Award,

} from 'lucide-react';

import { Link, Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { normalizeSection } from '@/constants/sections';



const statusConfig: Record<string, { label: string; className: string }> = {

  pending:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800' },

  ongoing:  { label: 'Ongoing',  className: 'bg-blue-100 text-blue-800' },

  placed:   { label: 'Placed',   className: 'bg-green-100 text-green-800' },

  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },

};



const StatusBadge = ({ status }: { status: string }) => {

  const cfg = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>;

};



const StudentStats = () => {

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: users, isLoading: usersLoading } = useUsers();

  const { data: applications = [] } = useApplications();



  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | 'placed' | 'unplaced'>('all');

  const [sectionFilter, setSectionFilter] = useState<'all' | 'A' | 'B' | 'AI/ML'>('all');

  const [selectedStudent, setSelectedStudent] = useState<BasicUser | null>(null);



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



  const students = (users || []).filter(u =>
    u.role === 'student' &&
    u.registerNumber?.trim() &&
    u.department?.trim() &&
    u.section?.trim()
  );

  const placedCount   = students.filter(s => s.isPlaced).length;

  const unplacedCount = students.length - placedCount;

  const averageGpa    = students.length

    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)

    : '0.00';

  const placementRate = students.length

    ? ((placedCount / students.length) * 100).toFixed(1)

    : '0.0';



  // Map studentId → their applications

  const appsByStudent = useMemo(() => {

    const map = new Map<string, Application[]>();

    for (const app of applications) {

      const sid = app.studentId?._id;

      if (!sid) continue;

      if (!map.has(sid)) map.set(sid, []);

      map.get(sid)!.push(app);

    }

    return map;

  }, [applications]);



  const filteredStudents = useMemo(() => {

    let list = students;

    if (statusFilter === 'placed')   list = list.filter(s => s.isPlaced);

    if (statusFilter === 'unplaced') list = list.filter(s => !s.isPlaced);

    if (sectionFilter !== 'all') {

      list = list.filter(s => normalizeSection(s.section) === sectionFilter);

    }

    if (searchTerm.trim()) {

      const term = searchTerm.toLowerCase();

      list = list.filter(s =>

        s.name?.toLowerCase().includes(term) ||

        s.email?.toLowerCase().includes(term) ||

        s.registerNumber?.toLowerCase().includes(term) ||

        s.department?.toLowerCase().includes(term) ||

        s.section?.toLowerCase().includes(term)

      );

    }

    return list;

  }, [students, statusFilter, sectionFilter, searchTerm]);



  // Data for the selected student's detail dialog

  const selectedApps = selectedStudent ? (appsByStudent.get(selectedStudent._id) ?? []) : [];

  const selectedRejected = selectedApps.filter(a => a.status === 'rejected');

  const selectedPlaced   = selectedApps.filter(a => a.status === 'placed');

  const selectedPending  = selectedApps.filter(a => a.status === 'pending' || a.status === 'ongoing');



  return (

    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 max-w-7xl">



        {/* Header */}

        <div className="mb-8">

          <Link to="/officer/dashboard">

            <Button variant="ghost" size="sm" className="gap-2 mb-4">

              <ArrowLeft className="w-4 h-4" /> Back to Dashboard

            </Button>

          </Link>

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

              <Users className="w-6 h-6 text-primary" />

            </div>

            <div>

              <h1 className="text-3xl font-heading font-bold text-foreground">Student Analytics</h1>

              <p className="text-muted-foreground">Complete placement details for every student</p>

            </div>

          </div>

        </div>



        {/* Summary Cards */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          {[

            { label: 'Total',     value: students.length,           icon: Users,        color: 'text-foreground',  bg: 'bg-muted/50', border: '' },

            { label: 'Placed',    value: placedCount,               icon: UserCheck,    color: 'text-success',     bg: 'bg-success/5',     border: 'border border-success/20' },

            { label: 'Unplaced',  value: unplacedCount,             icon: UserX,        color: 'text-warning',     bg: 'bg-warning/5',     border: 'border border-warning/20' },

            { label: 'Avg GPA',   value: averageGpa,                icon: GraduationCap,color: 'text-primary',     bg: 'bg-primary/5',     border: 'border border-primary/20' },

            { label: 'Rate',      value: `${placementRate}%`,       icon: TrendingUp,   color: 'text-success',     bg: 'bg-success/5',     border: 'border border-success/20' },

          ].map(card => (

            <Card key={card.label} className={`rounded-2xl ${card.bg} ${card.border}`}>

              <CardContent className="p-5">

                <card.icon className={`w-5 h-5 mb-2 ${card.color}`} />

                <p className={`text-3xl font-bold ${card.color}`}>{usersLoading ? '-' : card.value}</p>

                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>

              </CardContent>

            </Card>

          ))}

        </div>



        {/* Student Table */}

        <Card className="rounded-2xl">

          <CardHeader className="pb-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <CardTitle className="text-lg flex items-center gap-2">

                <BookOpen className="w-5 h-5" />

                Student Directory

                <Badge variant="outline" className="text-xs ml-1">{filteredStudents.length} students</Badge>

              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-3">

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input

                    placeholder="Search name, reg no, dept..."

                    value={searchTerm}

                    onChange={e => setSearchTerm(e.target.value)}

                    className="pl-9 w-64 rounded-lg"

                  />

                </div>

                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>

                  <SelectTrigger className="w-40 rounded-lg">

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="all">All Students</SelectItem>

                    <SelectItem value="placed">Placed</SelectItem>

                    <SelectItem value="unplaced">Unplaced</SelectItem>

                  </SelectContent>

                </Select>

                <Select value={sectionFilter} onValueChange={(v: any) => setSectionFilter(v)}>

                  <SelectTrigger className="w-36 rounded-lg">

                    <SelectValue placeholder="Section" />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="all">All Sections</SelectItem>

                    <SelectItem value="A">Section A</SelectItem>

                    <SelectItem value="B">Section B</SelectItem>

                    <SelectItem value="AI/ML">MSc AI/ML</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto rounded-b-2xl">

              <Table>

                <TableHeader>

                  <TableRow className="bg-muted/40">

                    <TableHead>Student</TableHead>

                    <TableHead>Register No.</TableHead>

                    <TableHead>Section</TableHead>

                    <TableHead>GPA</TableHead>

                    <TableHead className="text-center">Applied</TableHead>

                    <TableHead>Placement</TableHead>

                    <TableHead></TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {filteredStudents.length === 0 ? (

                    <TableRow>

                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">

                        No students found

                      </TableCell>

                    </TableRow>

                  ) : (

                    filteredStudents.map(student => {

                      const apps    = appsByStudent.get(student._id) ?? [];

                      const placedApp = apps.find(a => a.status === 'placed');

                      return (

                        <TableRow

                          key={student._id}

                          className="cursor-pointer hover:bg-muted/30 transition-colors"

                          onClick={() => setSelectedStudent(student)}

                        >

                          <TableCell>

                            <div className="flex items-center gap-3">

                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${student.isPlaced ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>

                                {student.name?.charAt(0) || '?'}

                              </div>

                              <div>

                                <p className="font-semibold text-sm">{student.name}</p>

                                <p className="text-xs text-muted-foreground">{student.email}</p>

                              </div>

                            </div>

                          </TableCell>

                          <TableCell className="text-sm font-mono">{student.registerNumber || '—'}</TableCell>

                          <TableCell className="text-sm">{student.section || '—'}</TableCell>

                          <TableCell>

                            <span className={`font-semibold ${(student.gpa || 0) >= 8 ? 'text-success' : (student.gpa || 0) >= 6 ? 'text-warning' : 'text-destructive'}`}>

                              {student.gpa?.toFixed(2) ?? '—'}

                            </span>

                          </TableCell>

                          <TableCell className="text-center">

                            <Badge variant="outline">{apps.length}</Badge>

                          </TableCell>

                          <TableCell>

                            {student.isPlaced

                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><CheckCircle2 className="w-3.5 h-3.5" />{placedApp?.companyId?.name || 'Placed'}</span>

                              : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" />Unplaced</span>}

                          </TableCell>

                          <TableCell>

                            <Button variant="ghost" size="icon" className="h-7 w-7">

                              <ChevronRight className="w-4 h-4" />

                            </Button>

                          </TableCell>

                        </TableRow>

                      );

                    })

                  )}

                </TableBody>

              </Table>

            </div>

          </CardContent>

        </Card>

      </div>



      {/* Student Detail Dialog */}

      <Dialog open={!!selectedStudent} onOpenChange={open => !open && setSelectedStudent(null)}>

        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-3 text-xl">

              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedStudent?.isPlaced ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>

                {selectedStudent?.name?.charAt(0) || '?'}

              </div>

              {selectedStudent?.name}

            </DialogTitle>

            <DialogDescription>

              Full placement profile and application history

            </DialogDescription>

          </DialogHeader>



          {selectedStudent && (

            <div className="space-y-6 mt-2">



              {/* Personal Details */}

              <Card className="rounded-xl">

                <CardHeader className="pb-2">

                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="flex items-center gap-2">

                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />

                      <div>

                        <p className="text-xs text-muted-foreground">Email</p>

                        <p className="text-sm font-medium break-all">{selectedStudent.email || '—'}</p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />

                      <div>

                        <p className="text-xs text-muted-foreground">Phone</p>

                        <p className="text-sm font-medium">{selectedStudent.phone || '—'}</p>

                      </div>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">Register Number</p>

                      <p className="text-sm font-mono font-medium">{selectedStudent.registerNumber || '—'}</p>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">Gender</p>

                      <p className="text-sm font-medium capitalize">{selectedStudent.gender || '—'}</p>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">Department</p>

                      <p className="text-sm font-medium">{selectedStudent.department || '—'}</p>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">Section</p>

                      <p className="text-sm font-medium">{selectedStudent.section || '—'}</p>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">GPA</p>

                      <p className={`text-sm font-bold ${(selectedStudent.gpa || 0) >= 8 ? 'text-success' : (selectedStudent.gpa || 0) >= 6 ? 'text-warning' : 'text-destructive'}`}>

                        {selectedStudent.gpa?.toFixed(2) ?? '—'}

                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-muted-foreground">Placement Status</p>

                      {selectedStudent.isPlaced

                        ? <span className="inline-flex items-center gap-1 text-sm font-bold text-success"><CheckCircle2 className="w-4 h-4" />Placed</span>

                        : <span className="inline-flex items-center gap-1 text-sm font-bold text-warning"><XCircle className="w-4 h-4" />Unplaced</span>}

                    </div>

                    {selectedStudent.resumeUrl && (

                      <div className="col-span-2">

                        <p className="text-xs text-muted-foreground mb-1">Resume</p>

                        <a

                          href={selectedStudent.resumeUrl}

                          target="_blank"

                          rel="noopener noreferrer"

                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"

                        >

                          <ExternalLink className="w-3.5 h-3.5" /> View Resume

                        </a>

                      </div>

                    )}

                    {selectedStudent.skills && selectedStudent.skills.length > 0 && (

                      <div className="col-span-2">

                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Award className="w-3 h-3" /> Skills</p>

                        <div className="flex flex-wrap gap-1.5">

                          {selectedStudent.skills.map((skill: string) => (

                            <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{skill}</span>

                          ))}

                        </div>

                      </div>

                    )}

                    {selectedStudent.certifications && selectedStudent.certifications.length > 0 && (

                      <div className="col-span-2">

                        <p className="text-xs text-muted-foreground mb-2">Certifications</p>

                        <div className="flex flex-wrap gap-1.5">

                          {selectedStudent.certifications.map((cert: string) => (

                            <span key={cert} className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{cert}</span>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>

                </CardContent>

              </Card>



              {/* Application Summary */}

              <div className="grid grid-cols-4 gap-3">

                {[

                  { label: 'Total Applied', value: selectedApps.length,    color: 'text-foreground',   bg: 'bg-muted/60',           icon: FileText },

                  { label: 'Placed At',     value: selectedPlaced.length,  color: 'text-success',      bg: 'bg-success/10',         icon: CheckCircle2 },

                  { label: 'Rejected By',   value: selectedRejected.length,color: 'text-destructive',  bg: 'bg-destructive/10',     icon: XCircle },

                  { label: 'Pending',       value: selectedPending.length, color: 'text-warning',      bg: 'bg-warning/10',         icon: Clock },

                ].map(stat => (

                  <div key={stat.label} className={`rounded-xl p-4 ${stat.bg} text-center`}>

                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />

                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>

                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>

                  </div>

                ))}

              </div>



              {/* Application History */}

              <Card className="rounded-xl">

                <CardHeader className="pb-2">

                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">

                    <Building2 className="w-4 h-4" /> Application History

                  </CardTitle>

                </CardHeader>

                <CardContent className="p-0">

                  {selectedApps.length === 0 ? (

                    <p className="text-sm text-muted-foreground text-center py-6">No applications found</p>

                  ) : (

                    <Table>

                      <TableHeader>

                        <TableRow className="bg-muted/30">

                          <TableHead>Company</TableHead>

                          <TableHead>Location</TableHead>

                          <TableHead>Applied On</TableHead>

                          <TableHead>Status</TableHead>

                        </TableRow>

                      </TableHeader>

                      <TableBody>

                        {selectedApps

                          .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())

                          .map(app => (

                            <TableRow key={app._id}>

                              <TableCell className="font-medium">{app.companyId?.name || '—'}</TableCell>

                              <TableCell className="text-sm text-muted-foreground">{app.companyId?.location || '—'}</TableCell>

                              <TableCell className="text-sm text-muted-foreground">

                                {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}

                              </TableCell>

                              <TableCell><StatusBadge status={app.status} /></TableCell>

                            </TableRow>

                          ))}

                      </TableBody>

                    </Table>

                  )}

                </CardContent>

              </Card>



              {/* Rejected Companies highlight */}

              {selectedRejected.length > 0 && (

                <Card className="rounded-xl border-red-200">

                  <CardHeader className="pb-2">

                    <CardTitle className="text-sm font-semibold text-destructive uppercase tracking-wide flex items-center gap-2">

                      <XCircle className="w-4 h-4" /> Rejected By

                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="flex flex-wrap gap-2">

                      {selectedRejected.map(app => (

                        <span key={app._id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">

                          {app.companyId?.name || 'Unknown'}

                        </span>

                      ))}

                    </div>

                  </CardContent>

                </Card>

              )}



            </div>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );

};



export default StudentStats;

