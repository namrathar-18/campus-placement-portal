import { Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, IndianRupee, CheckCircle2, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
  userGpa?: number;
  showActions?: boolean;
  onApply?: (companyId: string) => void;
  isPlaced?: boolean;
  hasApplied?: boolean;
}

const CompanyCard = ({ 
  company, 
  userGpa = 0, 
  showActions = true, 
  onApply,
  isPlaced = false,
  hasApplied = false 
}: CompanyCardProps) => {
  const navigate = useNavigate();
  const isEligible = userGpa >= (company.min_gpa || company.minGpa || 0);

  const getJobTypeBadge = () => {
    const jobType = company.job_type || company.jobType;
    switch (jobType) {
      case 'full-time':
      case 'Full-time':
        return <Badge className="bg-success/10 text-success border-success/20 font-medium">Full-time</Badge>;
      case 'internship':
      case 'Internship':
        return <Badge className="bg-accent/10 text-accent border-accent/20 font-medium">Internship</Badge>;
      default:
        return <Badge variant="secondary" className="font-medium">{jobType}</Badge>;
    }
  };

  const getActionButton = () => {
    if (isPlaced) {
      return (
        <Button 
          variant="outline" 
          className="flex-1 gap-2"
          disabled
        >
          <Ban className="w-4 h-4" />
          Already Placed
        </Button>
      );
    }
    
    if (hasApplied) {
      return (
        <Button 
          variant="outline" 
          className="flex-1 gap-2 border-success/30 text-success bg-success/10"
          disabled
        >
          <CheckCircle2 className="w-4 h-4" />
          Applied
        </Button>
      );
    }

    return (
      <Button 
        variant="hero" 
        className="flex-1"
        disabled={!isEligible}
        onClick={() => onApply?.(company._id)}
      >
        Apply Now
      </Button>
    );
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 border-border/50 bg-card rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg ring-3 ring-white">
              {company.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <p className="text-sm text-muted-foreground">{company.roles?.[0] || company.role || 'Position'}</p>
            </div>
          </div>
          {getJobTypeBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/50">
            <IndianRupee className="w-4 h-4 text-success" />
            <span className="font-semibold text-foreground">{company.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/50">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{company.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-warning" />
            <span>{new Date(company.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/50">
            <Briefcase className="w-4 h-4 text-accent" />
            <span>Min GPA: {company.min_gpa || company.minGpa || 0}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {company.eligibility || company.qualifications || company.description}
        </p>

        {!isEligible && !isPlaced && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ You need a minimum GPA of {company.min_gpa || company.minGpa || 0} to apply
            </p>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0 gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl"
            onClick={() => navigate(`/company/${company._id}`)}
          >
            View Details
          </Button>
          <div className="flex-1">
            {getActionButton()}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CompanyCard;
