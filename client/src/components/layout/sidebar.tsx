import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Shield, 
  Home, 
  AlertTriangle, 
  BarChart2, 
  Users, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Nav items config with role-based access
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home, 
      roles: ['user', 'manager', 'admin'] 
    },
    { 
      name: 'Incidents', 
      path: '/incidents', 
      icon: AlertTriangle, 
      roles: ['user', 'manager', 'admin'] 
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: BarChart2, 
      roles: ['manager', 'admin'] 
    },
    { 
      name: 'Teams', 
      path: '/teams', 
      icon: Users, 
      roles: ['user', 'manager', 'admin'] 
    },

  ];

  // Filter nav items by user role
  const filteredNavItems = navItems.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden text-slate-600 focus:outline-none"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:h-screen",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 lg:h-[73px]">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <div className="text-lg font-semibold text-slate-800">Incident Shield</div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium rounded-md",
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 mr-3")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-800">{user.username}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
