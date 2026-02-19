import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Company } from '@/types';
import { Plus, Pencil, Trash2, Building2, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';

const ManageCompanies = () => {
  const { toast } = useToast();
  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

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
    const payload = {
      name: formData.name,
      description: formData.description,
      industry: formData.industry,
      location: formData.location,
      salary: formData.salary,
      min_gpa: parseFloat(formData.minGpa || '0'),
      eligibility: formData.eligibility,
      deadline: formData.deadline,
      roles: formData.role ? [formData.role] : [],
      job_type: formData.jobType,
      status: 'active',
      detailsFile: formData.detailsFile,
    };

    try {
      if (editingCompany && editingCompany._id) {
        await updateCompany.mutateAsync({ id: editingCompany._id, ...payload });
        toast({ title: 'Company Updated', description: `${formData.name} has been updated.` });
      } else {
        await createCompany.mutateAsync(payload as any);
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
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Manage Companies
            </h1>
            <p className="text-muted-foreground">
              Add, edit, or remove company listings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        className="pl-8"
                        value={formData.salary}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const formatted = value ? parseFloat(value).toLocaleString('en-IN') : '';
                          setFormData({ ...formData, salary: formatted });
                        }}
                        placeholder="12,00,000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum GPA</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.minGpa}
                      onChange={(e) => setFormData({ ...formData, minGpa: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value: 'full-time' | 'internship' | 'both') =>
                        setFormData({ ...formData, jobType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Eligibility</Label>
                  <Input
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload Details (PDF)</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          toast({ title: 'Error', description: 'Please upload a PDF file', variant: 'destructive' });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData({ ...formData, detailsFile: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {formData.detailsFile && (
                    <p className="text-xs text-muted-foreground">✓ File uploaded</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingCompany ? 'Update Company' : 'Add Company'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
              key={company._id || company.id}
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(company._id || company.id)}
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
