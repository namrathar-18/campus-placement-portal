import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Building2, Search, Loader2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany, useBootstrapCompanies, type Company, type CompanyInsert } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { exportCompanyStudentsPdf } from '@/lib/exportCompanyStudentsPdf';

const ManageCompanies = () => {
  const { toast } = useToast();
  const { data: companies = [], isLoading } = useCompanies();
  const { data: applications = [] } = useApplications();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const bootstrapCompanies = useBootstrapCompanies();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    salary: '',
    minGpa: '',
    description: '',
    industry: '',
    eligibility: '',
    deadline: '',
    location: '',
    jobType: 'full-time' as 'full-time' | 'internship' | 'both',
    detailsFile: '' as string,
  });

  const filteredCompanies = companies.filter((company) => {
    const searchTarget = `${company.name} ${(company.roles || []).join(' ')} ${company.industry || ''}`.toLowerCase();
    return searchTarget.includes(searchTerm.toLowerCase());
  });

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        role: company.roles?.[0] || '',
        salary: company.salary || '',
        minGpa: (company.min_gpa ?? '').toString(),
        description: company.description,
        industry: company.industry || '',
        eligibility: company.eligibility || '',
        deadline: company.deadline ? company.deadline.toString().substring(0,10) : '',
        location: company.location || '',
        jobType: company.job_type || 'full-time',
        detailsFile: (company as any).detailsFile || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        role: '',
        salary: '',
        minGpa: '',
        description: '',
        industry: '',
        eligibility: '',
        deadline: '',
        location: '',
        jobType: 'full-time',
        detailsFile: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const packageValue = parseFloat(formData.salary.replace(/,/g, '')) || 0;
    const payload: CompanyInsert = {
      name: formData.name,
      description: formData.description,
      industry: formData.industry,
      location: formData.location,
      package: packageValue,
      salary: formData.salary,
      min_gpa: parseFloat(formData.minGpa || '0'),
      eligibility: formData.eligibility,
      deadline: formData.deadline,
      roles: formData.role ? [formData.role] : [],
      job_type: formData.jobType,
      status: 'active',
      ...(formData.detailsFile ? { detailsFile: formData.detailsFile } : {}),
    };

    try {
      if (editingCompany && editingCompany._id) {
        await updateCompany.mutateAsync({ id: editingCompany._id, ...payload });
        toast({ title: 'Company Updated', description: `${formData.name} has been updated.` });
      } else {
        await createCompany.mutateAsync(payload);
        toast({ title: 'Company Added', description: `${formData.name} has been added.` });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save company', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany.mutateAsync(id);
      toast({ title: 'Company Deleted', description: `The company has been removed.`, variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete company', variant: 'destructive' });
    }
  };

  const handleBootstrap = async () => {
    try {
      const response = await bootstrapCompanies.mutateAsync();
      const synced = response?.data?.total ?? 0;
      toast({
        title: 'Companies Synced',
        description: `${synced} default companies synced to MongoDB.`,
      });
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error?.message || 'Could not sync default companies.',
        variant: 'destructive',
      });
    }
  };

  const downloadCompanyStudentsPdf = (company: Company, reportType: 'applied' | 'approved') => {
    const companyApplications = applications.filter((application) => application.companyId?._id === company._id);
    const approvedStatuses = new Set(['approved', 'selected', 'placed']);
    const filteredApplications =
      reportType === 'approved'
        ? companyApplications.filter((application) => approvedStatuses.has((application.status || '').toLowerCase()))
        : companyApplications;

    if (filteredApplications.length === 0) {
      toast({
        title: 'No data available',
        description: `No ${reportType} students found for ${company.name}.`,
        variant: 'destructive',
      });
      return;
    }

    const uniqueStudentsMap = filteredApplications.reduce<Map<string, {
      name: string;
      registerNumber?: string;
      department?: string;
      email?: string;
      status: string;
      appliedDate?: string;
    }>>((acc, application) => {
      const studentId = application.studentId?._id;
      if (!studentId || acc.has(studentId)) return acc;

      const normalizedStatus = application.status
        ? application.status.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : 'N/A';

      acc.set(studentId, {
        name: application.studentId?.name || 'N/A',
        registerNumber: application.studentId?.registerNumber,
        department: application.studentId?.department,
        email: application.studentId?.email,
        status: normalizedStatus,
        appliedDate: application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : undefined,
      });
      return acc;
    }, new Map());

    exportCompanyStudentsPdf({
      companyName: company.name,
      reportType,
      students: Array.from(uniqueStudentsMap.values()),
    });

    toast({
      title: 'PDF exported',
      description: `${reportType === 'applied' ? 'Applied' : 'Approved'} students PDF downloaded for ${company.name}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Manage Companies</h1>
            <p className="text-muted-foreground">Add, edit, or remove company listings</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form fields same as before */}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {filteredCompanies.map((company, index) => (
            <Card
              key={company._id}
              className="animate-slide-up hover:shadow-card-hover transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg ring-3 ring-white">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-muted-foreground">{company.roles?.[0] || 'Role'}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-success font-medium">₹{company.salary || company.package?.toLocaleString?.('en-IN') || 'TBD'}</span>
                        <span className="text-muted-foreground">Min GPA: {company.min_gpa ?? 'N/A'}</span>
                        <span className="text-muted-foreground">{company.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadCompanyStudentsPdf(company, 'applied')}>
                      <FileDown className="w-4 h-4 mr-1" /> Applied PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadCompanyStudentsPdf(company, 'approved')}>
                      <FileDown className="w-4 h-4 mr-1" /> Approved PDF
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(company)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(company._id)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
              <p className="text-muted-foreground">Add your first company to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCompanies;