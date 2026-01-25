import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { LogOut, Bell, User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import christLogo from '@/assets/christ-university-logo.png';

const Navbar = () => {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Count only unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) return null;
  // Don't return null for unauthenticated users - let them see the login page navbar if needed
  // Only return null if they're in a protected area
  if (!isAuthenticated) return null;

  const getNavLinks = () => {
    if (user?.role === 'student') {
      return [
        { to: '/student/dashboard', label: 'Dashboard' },
        { to: '/student/companies', label: 'Companies' },
        { to: '/student/applications', label: 'My Applications' },
        { to: '/student/stats', label: 'Placement Stats' },
      ];
    }
    if (user?.role === 'placement_officer') {
      return [
        { to: '/officer/dashboard', label: 'Dashboard' },
        { to: '/officer/companies', label: 'Manage Companies' },
        { to: '/officer/applications', label: 'Applications' },
        { to: '/officer/notifications', label: 'Notifications' },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={christLogo} 
              alt="Christ University Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {links.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link to={user?.role === 'student' ? '/student/notifications' : '/officer/notifications'}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700">
              <User className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await signOut();
                // Give React time to update state before navigating
                setTimeout(() => navigate('/login', { replace: true }), 0);
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// comment