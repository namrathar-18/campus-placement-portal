import { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const getTypeConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-success/5',
          iconColor: 'text-success',
          borderColor: 'border-l-success',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-warning/5',
          iconColor: 'text-warning',
          borderColor: 'border-l-warning',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-primary/5',
          iconColor: 'text-primary',
          borderColor: 'border-l-primary',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.borderColor} ${config.bgColor} transition-all duration-300 hover:shadow-card-hover`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`mt-0.5 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">{notification.title}</h3>
              <span className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
