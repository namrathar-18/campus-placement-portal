import { Application } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Users, Send } from 'lucide-react';

interface ApplicationStatusCardProps {
  application: Application;
}

const ApplicationStatusCard = ({ application }: ApplicationStatusCardProps) => {
  const getStatusConfig = () => {
    switch (application.status) {
      case 'applied':
        return {
          icon: Send,
          label: 'Applied',
          color: 'bg-muted text-muted-foreground',
          borderColor: 'border-muted',
        };
      case 'shortlisted':
        return {
          icon: Users,
          label: 'Shortlisted',
          color: 'bg-accent/10 text-accent',
          borderColor: 'border-accent/30',
        };
      case 'interview':
        return {
          icon: Clock,
          label: 'Interview',
          color: 'bg-warning/10 text-warning',
          borderColor: 'border-warning/30',
        };
      case 'selected':
        return {
          icon: CheckCircle,
          label: 'Selected',
          color: 'bg-success/10 text-success',
          borderColor: 'border-success/30',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'bg-destructive/10 text-destructive',
          borderColor: 'border-destructive/30',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`transition-all duration-300 hover:shadow-card-hover border-l-4 ${config.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg ring-2 ring-white">
              {application.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{application.companyName}</h3>
              <p className="text-sm text-muted-foreground">
                Applied on {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`gap-1.5 ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusCard;
