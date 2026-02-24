import { FormEvent, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Linkedin, Mail, GraduationCap, Building2 } from 'lucide-react';
import { alumniData } from '@/data/alumniData';
import { useToast } from '@/hooks/use-toast';
import type { Alumni } from '@/data/alumniData';

const AlumniConnect = () => {
  const [company, setCompany] = useState('');
  const [searchedCompany, setSearchedCompany] = useState('');
  const [currentResults, setCurrentResults] = useState<Alumni[]>([]);
  const { toast } = useToast();

  const totalCompanies = useMemo(
    () => new Set(alumniData.map((item) => item.currentCompany)).size,
    []
  );

  const normalizeCompany = (value: string) =>
    value.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');

  const aliases: Record<string, string[]> = {
    tcs: ['tcs', 'tata consultancy services', 'tata consulting services'],
    ltimindtree: ['ltimindtree', 'lti mindtree', 'mindtree', 'larsen and toubro infotech'],
    phonepe: ['phonepe', 'phone pe'],
    cred: ['cred', 'dreamplug technologies'],
  };

  const isCompanyMatch = (inputCompany: string, targetCompany: string) => {
    const normalizedInput = normalizeCompany(inputCompany);
    const normalizedTarget = normalizeCompany(targetCompany);

    if (!normalizedInput || !normalizedTarget) {
      return false;
    }

    if (
      normalizedInput === normalizedTarget ||
      normalizedTarget.includes(normalizedInput) ||
      normalizedInput.includes(normalizedTarget)
    ) {
      return true;
    }

    for (const aliasGroup of Object.values(aliases)) {
      const normalizedAliases = aliasGroup.map(normalizeCompany);
      if (normalizedAliases.includes(normalizedInput) && normalizedAliases.includes(normalizedTarget)) {
        return true;
      }
    }

    return false;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const queryCompany = company.trim();

    if (!queryCompany) {
      toast({
        title: 'Company required',
        description: 'Please enter a company name.',
        variant: 'destructive',
      });
      return;
    }

    const current = alumniData.filter((alumni) =>
      isCompanyMatch(queryCompany, alumni.currentCompany)
    );

    setSearchedCompany(queryCompany);
    setCurrentResults(current);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Header */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Alumni Connect</h1>
                <p className="text-muted-foreground">Find alumni working at your dream company</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Users className="w-3.5 h-3.5" />
                {alumniData.length} Alumni
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Building2 className="w-3.5 h-3.5" />
                {totalCompanies} Companies
              </Badge>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <Card className="mb-8 rounded-2xl shadow-sm border-border/60">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Search by company name (e.g., Infosys, TCS, Google)..."
                  className="h-12 pl-10 rounded-xl text-base"
                />
              </div>
              <Button type="submit" className="h-12 px-8 rounded-xl text-base">
                Search Alumni
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {!!searchedCompany && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Results for "<span className="text-primary">{searchedCompany}</span>"
              </h2>
              <Badge variant="outline" className="text-sm">
                {currentResults.length} found
              </Badge>
            </div>

            {currentResults.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {currentResults.map((alumni) => (
                  <Card key={`${alumni.name}-${alumni.email}`} className="rounded-2xl hover:shadow-md transition-shadow border-border/60">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-lg">
                          {alumni.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{alumni.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {alumni.currentCompany} · Batch {alumni.batch}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <a
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              href={alumni.linkedin}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                              LinkedIn
                            </a>
                            <a
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              href={`mailto:${alumni.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {alumni.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl">
                <CardContent className="py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No alumni found for "{searchedCompany}"</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different company name or spelling</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state when no search */}
        {!searchedCompany && (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="py-16 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Search for a company to find alumni</p>
              <p className="text-sm text-muted-foreground mt-1">Enter a company name above to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlumniConnect;
