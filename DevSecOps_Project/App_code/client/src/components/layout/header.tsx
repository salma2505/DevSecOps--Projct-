import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth');
      }
    });
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          {!isMobile && (
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-slate-800 ml-2">Incident Shield</span>
            </div>
          )}
          {/* Mobile shows empty space for the menu button */}
          {isMobile && <div className="w-6" />}
        </div>

        <div className="flex items-center space-x-4">
          {user?.role !== 'user' && (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white" 
              onClick={() => setLocation('/incidents')}
            >
              Create Incident
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.username.substring(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setLocation('/profile')}>
                Profile
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <DropdownMenuItem onSelect={() => setLocation('/settings')}>
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onSelect={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
