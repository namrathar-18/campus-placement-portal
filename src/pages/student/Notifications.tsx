import { useAuth } from '@/hooks/useAuth';
import { useNotifications, useMarkNotificationAsRead } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const Notifications = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  // Mark all notifications as read when page loads
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => {
        if (!notification.isRead) {
          markAsRead(notification._id);
        }
      });
    }
  }, [notifications, markAsRead]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Latest updates and announcements for your placement journey
          </p>
        </div>

        {/* Notifications */}
        <div className="max-w-3xl mx-auto">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`animate-slide-up ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div
                      className={`p-4 rounded-lg border ${
                        notification.type === 'success'
                          ? 'bg-success/5 border-success/20'
                          : notification.type === 'warning'
                          ? 'bg-warning/5 border-warning/20'
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            notification.type === 'success'
                              ? 'text-success'
                              : notification.type === 'warning'
                              ? 'text-warning'
                              : 'text-primary'
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.createdAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-center">
                  No notifications yet. Check back soon for updates!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
