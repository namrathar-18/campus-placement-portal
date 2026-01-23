import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, variant = 'default' }: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/5 border-primary/20';
      case 'success':
        return 'bg-success/5 border-success/20';
      case 'warning':
        return 'bg-warning/5 border-warning/20';
      default:
        return 'bg-card border-border/50';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${getVariantStyles()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-heading font-bold text-foreground">{value}</p>
            {trend && (
              <p className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${getIconStyles()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
