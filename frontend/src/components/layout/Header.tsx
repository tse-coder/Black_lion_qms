import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Menu,
  Globe,
  Home,
  LayoutDashboard,
  UserPlus,
  Monitor
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Admin':
        return '/admin';
      case 'Doctor':
        return '/doctor';
      case 'Lab Technician':
        return '/lab';
      case 'Patient':
        return '/patient';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Black Lion Hospital QMS" 
            className="h-14 object-contain rounded-lg"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              {t('home')}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/check-in">
              <UserPlus className="h-4 w-4 mr-2" />
              {t('checkIn')}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/display">
              <Monitor className="h-4 w-4 mr-2" />
              {t('display')}
            </Link>
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={getDashboardRoute()}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t('dashboard')}
              </Link>
            </Button>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{language === 'en' ? 'EN' : 'አማ'}</span>
          </Button>

          {/* User Menu or Login */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getDashboardRoute()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">{t('login')}</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t('home')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/check-in">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('checkIn')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/display">
                  <Monitor className="mr-2 h-4 w-4" />
                  {t('display')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
