import { useEffect, useState } from 'react';
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.registerNumber}
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.section || 'N/A'}</TableCell>
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
                            onClick={() =>
                              updatePlacementStatus(student._id, !student.isPlaced)
                            }
                          >
                            {student.isPlaced ? 'Mark Unplaced' : 'Mark Placed'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
                              app.status === 'approved'
                                ? 'default'
                                : app.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {app.status}
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
