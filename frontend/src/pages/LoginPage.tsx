import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, ArrowLeft, User, Stethoscope, FlaskConical, Shield } from 'lucide-react';

// Demo credentials for quick login
const DEMO_ACCOUNTS = [
  { email: 'admin@blacklion.com', password: 'admin123', role: 'Admin', icon: Shield },
  { email: 'doctor@blacklion.com', password: 'doctor123', role: 'Doctor', icon: Stethoscope },
  { email: 'labtech@blacklion.com', password: 'labtech123', role: 'Lab Technician', icon: FlaskConical },
  { email: 'patient@blacklion.com', password: 'patient123', role: 'Patient', icon: User },
];

export default function LoginPage() {
  const { t } = useLanguage();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await login(email, password);
    
    if (success) {
      // Redirect based on role (handled in the auth context)
      // For now, go to the intended destination or role-based dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const dashboardRoutes: Record<string, string> = {
        'Admin': '/admin',
        'Doctor': '/doctor',
        'Lab Technician': '/lab',
        'Patient': '/patient',
      };
      navigate(dashboardRoutes[user.role] || from, { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSubmitting(true);

    const success = await login(demoEmail, demoPassword);
    
    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const dashboardRoutes: Record<string, string> = {
        'Admin': '/admin',
        'Doctor': '/doctor',
        'Lab Technician': '/lab',
        'Patient': '/patient',
      };
      navigate(dashboardRoutes[user.role] || '/', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Link>
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Black Lion Hospital QMS" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <CardTitle className="text-2xl">{t('welcomeBack')}</CardTitle>
              <CardDescription>{t('loginDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg" 
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t('loading')}
                    </>
                  ) : (
                    t('login')
                  )}
                </Button>
              </form>

              {/* Demo Login Section */}
              <div className="space-y-4">
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    {t('demoLogin')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((account) => {
                    const Icon = account.icon;
                    return (
                      <Button
                        key={account.email}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoLogin(account.email, account.password)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{account.role}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <p className="text-xs text-center text-muted-foreground">
                  Click any role above to login with demo credentials
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
