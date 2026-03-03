import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, CheckCircle, XCircle, Mail } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useApplications } from '@/hooks/useApplications';
import { exportPlacedApprovedStudentsPdf } from '@/lib/exportPlacedApprovedStudentsPdf';
import { SECTION_OPTIONS } from '@/constants/sections';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email?: string;
  phone?: string;
  department: string;
  section?: string;
  gpa?: number;
  isPlaced: boolean;
  resumeUrl?: string;
}

const ManageStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: applications = [] } = useApplications();

  const formatStatusLabel = (status: string) => {
    if (!status) return 'Pending';
    return status
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const groupedStudents = useMemo(() => {
    return filteredStudents.reduce<Record<string, Student[]>>((acc, student) => {
      const section = (student.section || 'Unassigned').trim() || 'Unassigned';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(student);
      return acc;
    }, {});
  }, [filteredStudents]);

  const sectionKeys = useMemo(
    () =>
      Object.keys(groupedStudents).sort((a, b) => {
        const aIndex = SECTION_OPTIONS.findIndex((section) => section === a);
        const bIndex = SECTION_OPTIONS.findIndex((section) => section === b);
        const aKnown = aIndex !== -1;
        const bKnown = bIndex !== -1;

        if (aKnown && bKnown) return aIndex - bIndex;
        if (aKnown) return -1;
        if (bKnown) return 1;
        return a.localeCompare(b);
      }),
    [groupedStudents]
  );

  const approvedCompanyByStudent = useMemo(() => {
    return applications.reduce<Map<string, string>>((acc, application) => {
      if (application.status !== 'approved') return acc;
      const studentId = application.studentId?._id;
      if (!studentId || acc.has(studentId)) return acc;
      acc.set(studentId, application.companyId?.name || 'Approved Company');
      return acc;
    }, new Map<string, string>());
  }, [applications]);

  const placedOrApprovedStudents = useMemo(() => {
    return students
      .filter((student) => student.isPlaced || approvedCompanyByStudent.has(student._id))
      .map((student) => ({
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        section: student.section,
        gpa: student.gpa,
        isPlaced: student.isPlaced,
        approvedCompany: approvedCompanyByStudent.get(student._id),
      }));
  }, [students, approvedCompanyByStudent]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, placementFilter, students]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/representative/students');
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply placement status filter
    if (placementFilter === 'placed') {
      filtered = filtered.filter((student) => student.isPlaced);
    } else if (placementFilter === 'unplaced') {
      filtered = filtered.filter((student) => !student.isPlaced);
    }

    setFilteredStudents(filtered);
  };

  const viewStudentDetails = async (studentId: string) => {
    try {
      const response = await api.get(`/representative/student/${studentId}`);
      setSelectedStudent(response.data);
      setViewDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch student details',
        variant: 'destructive',
      });
    }
  };

  const updatePlacementStatus = async (studentId: string, isPlaced: boolean) => {
    try {
      await api.post('/representative/update-student-status', {
        studentId,
        isPlaced,
      });
      
      toast({
        title: 'Success',
        description: `Student marked as ${isPlaced ? 'placed' : 'unplaced'}`,
      });
      
      fetchStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update placement status',
        variant: 'destructive',
      });
    }
  };

  const downloadPlacedApprovedPdf = () => {
    if (placedOrApprovedStudents.length === 0) {
      toast({
        title: 'No data available',
        description: 'No placed or approved students found to export.',
        variant: 'destructive',
      });
      return;
    }

    exportPlacedApprovedStudentsPdf(placedOrApprovedStudents, 'representative-placed-approved-students');
    toast({
      title: 'PDF exported',
      description: `Downloaded ${placedOrApprovedStudents.length} students in PDF format.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Manage Students</h1>
        <p className="text-muted-foreground">
          View and manage students in your department
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, register number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="unplaced">Unplaced</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={downloadPlacedApprovedPdf}>
              Download Placed/Approved PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="space-y-6">
              {sectionKeys.map((section) => (
                <div key={section} className="rounded-md border">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <p className="font-semibold">Section {section}</p>
                    <Badge variant="outline">{groupedStudents[section].length} Students</Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Register Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedStudents[section].map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">{student.registerNumber}</TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => viewStudentDetails(student._id)}
                              className="text-left font-medium text-primary hover:underline"
                            >
                              {student.name}
                            </button>
                          </TableCell>
                          <TableCell>{student.gpa ? student.gpa.toFixed(2) : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={student.isPlaced ? 'default' : 'secondary'}
                              className={student.isPlaced ? 'bg-green-600' : ''}
                            >
                              {student.isPlaced ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Placed
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unplaced
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewStudentDetails(student._id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant={student.isPlaced ? 'destructive' : 'default'}
                                onClick={() => updatePlacementStatus(student._id, !student.isPlaced)}
                              >
                                {student.isPlaced ? 'Mark Unplaced' : 'Mark Placed'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student and their applications
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedStudent.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Register Number</p>
                  <p className="font-medium">{selectedStudent.student.registerNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedStudent.student.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStudent.student.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedStudent.student.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{selectedStudent.student.section || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="font-medium">
                    {selectedStudent.student.gpa ? selectedStudent.student.gpa.toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Status</p>
                  <Badge
                    variant={selectedStudent.student.isPlaced ? 'default' : 'secondary'}
                    className={selectedStudent.student.isPlaced ? 'bg-green-600' : ''}
                  >
                    {selectedStudent.student.isPlaced ? 'Placed' : 'Unplaced'}
                  </Badge>
                </div>
              </div>

              {/* Pending Companies */}
              <div>
                <h3 className="font-semibold mb-3">Pending Company List</h3>
                {selectedStudent.applications?.filter((app: any) => app.status === 'pending' || app.status === 'ongoing').length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.applications
                      .filter((app: any) => app.status === 'pending' || app.status === 'ongoing')
                      .map((app: any) => (
                        <div key={app._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{app.companyId?.name || 'Unknown Company'}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{app.companyId?.location || 'Location N/A'}</p>
                            </div>
                            <Badge variant="secondary">
                              {formatStatusLabel(app.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending companies for this student.</p>
                )}
              </div>

              {/* Applications */}
              <div>
                <h3 className="font-semibold mb-3">Applications History</h3>
                {selectedStudent.applications && selectedStudent.applications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.applications.map((app: any) => (
                      <div key={app._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{app.companyId?.name || 'Unknown Company'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {app.companyId?.location || 'Location N/A'}
                            </p>
                            <p className="text-sm mt-1">
                              Package: ₹{app.companyId?.package || 'N/A'} LPA
                            </p>
                          </div>
                          <Badge
                            variant={
                              app.status === 'placed'
                                ? 'default'
                                : app.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {formatStatusLabel(app.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudents;
