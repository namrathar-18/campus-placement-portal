import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Building2, Search, Loader2, FileDown, Paperclip, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useBootstrapCompanies,
  type Company,
  type CompanyInsert,
} from '@/hooks/useCompanies';

const ManageCompanies = () => {
  const { toast } = useToast();
  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const bootstrapCompanies = useBootstrapCompanies();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    websiteUrl: '',
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
      setSelectedFileName((company as any).detailsFile ? `${company.name}_Details.pdf` : '');
      setFormData({
        name: company.name,
        role: company.roles?.[0] || '',
        websiteUrl: (company as any).websiteUrl || '',
        salary: company.salary || '',
        minGpa: (company.min_gpa ?? '').toString(),
        description: company.description,
        industry: company.industry || '',
        eligibility: company.eligibility || '',
        deadline: company.deadline ? company.deadline.toString().substring(0, 10) : '',
        location: company.location || '',
        jobType: company.job_type || 'full-time',
        detailsFile: (company as any).detailsFile || '',
      });
    } else {
      setEditingCompany(null);
      setSelectedFileName('');
      setFormData({
        name: '',
        role: '',
        websiteUrl: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file under 5 MB.', variant: 'destructive' });
      return;
    }
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, detailsFile: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const packageValue = parseFloat(formData.salary.replace(/,/g, '')) || 0;
    const payload: CompanyInsert = {
      name: formData.name,
      description: formData.description,
      websiteUrl: formData.websiteUrl,
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
    // Placeholder: you can implement actual PDF logic here
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Google" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g. Technology" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Software Engineer" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Bengaluru" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Company URL</Label>
                    <Input id="websiteUrl" value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} placeholder="https://company.com/careers" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Package</Label>
                      <Input id="salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. 12 LPA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minGpa">Minimum GPA</Label>
                      <Input id="minGpa" type="number" step="0.1" min="0" max="10" value={formData.minGpa} onChange={(e) => setFormData({ ...formData, minGpa: e.target.value })} placeholder="e.g. 7.0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={formData.jobType} onValueChange={(v: 'full-time' | 'internship' | 'both') => setFormData({ ...formData, jobType: v })}>
                        <SelectTrigger id="jobType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility Criteria</Label>
                    <Input id="eligibility" value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} placeholder="e.g. MCA / MSc AIML" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the company and role..." rows={3} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Details File <span className="text-muted-foreground text-xs">(PDF, max 5 MB)</span></Label>
                    <label className="flex items-center gap-3 border border-dashed border-border rounded-md px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {selectedFileName || 'Click to upload a file...'}
                      </span>
                      {selectedFileName && (
                        <button type="button" onClick={(e) => { e.preventDefault(); setSelectedFileName(''); setFormData((p) => ({ ...p, detailsFile: '' })); }}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                      <input id="detailsFile" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="hero" disabled={createCompany.isPending || updateCompany.isPending}>
                      {(createCompany.isPending || updateCompany.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {editingCompany ? 'Save Changes' : 'Add Company'}
                    </Button>
                  </div>
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
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(company)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(company._id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
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