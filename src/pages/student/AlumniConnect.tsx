import { FormEvent, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { alumniData } from '@/data/alumniData';
import { useToast } from '@/hooks/use-toast';
import type { Alumni } from '@/data/alumniData';

const AlumniConnect = () => {
  const [company, setCompany] = useState('');
  const [searchedCompany, setSearchedCompany] = useState('');
  const [currentResults, setCurrentResults] = useState<Alumni[]>([]);
  const [formerResults, setFormerResults] = useState<Array<Alumni & { formerRecord: { company: string; role: string; fromYear: string; toYear: string } }>>([]);
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

    const former = alumniData
      .filter((alumni) => !isCompanyMatch(queryCompany, alumni.currentCompany))
      .flatMap((alumni) => {
        const formerMatches = (alumni.workHistory || []).filter(
          (record) => record.toYear !== 'Present' && isCompanyMatch(queryCompany, record.company)
        );

        return formerMatches.map((formerRecord) => ({
          ...alumni,
          formerRecord,
        }));
      });

    setSearchedCompany(queryCompany);
    setCurrentResults(current);
    setFormerResults(former);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Camps Portal Connect</h1>
          <p className="text-muted-foreground">Find alumni currently working in your target company.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Alumni Company Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3">
              <Input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Enter company name (e.g., Infosys, TCS, Google)"
                className="h-11"
              />
              <Button type="submit" className="h-11 min-w-28">Search</Button>
            </form>

            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Users className="w-3.5 h-3.5" />
                {alumniData.length} Alumni
              </Badge>
              <Badge variant="outline">{totalCompanies} Companies</Badge>
            </div>
          </CardContent>
        </Card>

        {!!searchedCompany && (
          <Card>
            <CardHeader>
              <CardTitle>{searchedCompany} Alumni</CardTitle>
            </CardHeader>
            <CardContent>
              {currentResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Found <span className="font-semibold text-foreground">{currentResults.length}</span> alumni
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentResults.map((alumni) => (
                      <div key={`${alumni.name}-${alumni.email}`} className="border border-border rounded-xl p-4">
                        <p className="font-semibold text-foreground">{alumni.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Batch {alumni.batch}</p>
                        <a className="text-sm text-primary hover:underline block mt-2" href={alumni.linkedin} target="_blank" rel="noreferrer">
                          LinkedIn Profile
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">{alumni.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No alumni found for {searchedCompany}.</p>
              )}
              {formerResults.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Additional alumni: <span className="font-semibold text-foreground">{formerResults.length}</span>
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {formerResults.map((alumni) => (
                      <div key={`${alumni.name}-${alumni.formerRecord.company}-${alumni.formerRecord.fromYear}`} className="border border-border rounded-xl p-4">
                        <p className="font-semibold text-foreground">{alumni.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Batch {alumni.batch}</p>
                        <a className="text-sm text-primary hover:underline block mt-2" href={alumni.linkedin} target="_blank" rel="noreferrer">
                          LinkedIn Profile
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">{alumni.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlumniConnect;
