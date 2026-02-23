import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, TrendingUp, Building2, Users } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PlacementReport {
  department: string;
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementPercentage: string;
  companyWisePlacements: {
    [key: string]: {
      count: number;
      package: number;
      location: string;
    };
  };
  studentsList: any[];
}

const PlacementReport = () => {
  const [report, setReport] = useState<PlacementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/representative/placement-report');
      setReport(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch placement report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    // CSV Header
    let csv = 'Register Number,Name,GPA,Placement Status\n';

    // CSV Data
    report.studentsList.forEach((student) => {
      csv += `${student.registerNumber},${student.name},${student.gpa || 'N/A'},${
        student.isPlaced ? 'Placed' : 'Unplaced'
      }\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-report-${report.department}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'Success',
      description: 'Report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No report data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companiesList = Object.entries(report.companyWisePlacements).sort(
    ([, a], [, b]) => b.count - a.count
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Placement Report</h1>
          <p className="text-muted-foreground">
            Comprehensive placement statistics for {report.department}
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{report.totalStudents}</div>
            <p className="text-sm text-muted-foreground mt-1">In {report.department}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Placed Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {report.placedStudents}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {report.placementPercentage}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {companiesList.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Companies hired</p>
          </CardContent>
        </Card>
      </div>

      {/* Company-wise Placements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company-wise Placements</CardTitle>
        </CardHeader>
        <CardContent>
          {companiesList.length > 0 ? (
            <div className="space-y-4">
              {companiesList.map(([company, data]) => (
                <div
                  key={company}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{company}</h4>
                    <p className="text-sm text-muted-foreground">{data.location}</p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="font-semibold">₹{data.package} LPA</p>
                    <p className="text-sm text-muted-foreground">Package</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {data.count} {data.count === 1 ? 'Student' : 'Students'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No placement data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
              <div>Register Number</div>
              <div>Name</div>
              <div>GPA</div>
              <div>Status</div>
            </div>
            {report.studentsList.map((student) => (
              <div
                key={student._id}
                className="grid grid-cols-4 gap-4 py-3 border-b hover:bg-accent transition-colors"
              >
                <div className="font-medium">{student.registerNumber}</div>
                <div>{student.name}</div>
                <div>{student.gpa ? student.gpa.toFixed(2) : 'N/A'}</div>
                <div>
                  <Badge
                    variant={student.isPlaced ? 'default' : 'secondary'}
                    className={student.isPlaced ? 'bg-green-600' : ''}
                  >
                    {student.isPlaced ? 'Placed' : 'Unplaced'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{report.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{report.placedStudents}</p>
                <p className="text-sm text-muted-foreground">Placed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {report.unplacedStudents}
                </p>
                <p className="text-sm text-muted-foreground">Unplaced</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{report.placementPercentage}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacementReport;
