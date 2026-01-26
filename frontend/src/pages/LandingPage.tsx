import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { queueApi } from '@/lib/api';
import { QueueStatusCard } from '@/components/queue';
import { 
  Search, 
  UserPlus, 
  Monitor, 
  Activity, 
  Users, 
  Clock,
  Loader2,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Determine if it's a phone number or queue number
      const isPhone = searchQuery.startsWith('+') || searchQuery.startsWith('0') || /^\d{10,}$/.test(searchQuery);
      
      if (isPhone) {
        const response = await queueApi.searchByPhone(searchQuery);
        if (response.data.success) {
          setSearchResult({
            type: 'phone',
            data: response.data.data,
          });
        }
      } else {
        const response = await queueApi.search(searchQuery);
        if (response.data.success) {
          setSearchResult({
            type: 'queue',
            data: response.data.data,
          });
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('queueNotFound');
      setSearchError(message);
      toast({
        title: t('error'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Black Lion Hospital QMS" 
                className="h-44 object-contain rounded-lg shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              {t('welcomeTitle')}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              {t('welcomeSubtitle')}
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-foreground bg-background"
                  />
                </div>
                <Button type="submit" size="lg" variant="secondary" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    t('searchButton')
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="h-14 px-8 font-bold text-lg shadow-xl shadow-black/10">
                <Link to="/check-in">
                  <UserPlus className="h-6 w-6 mr-2" />
                  {t('getNewTicket')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 font-bold text-lg bg-white/10 hover:bg-white/20 border-white/30 text-white">
                <Link to="/appointment">
                  <CalendarDays className="h-6 w-6 mr-2" />
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {(searchResult || searchError) && (
          <section className="py-8 px-4 bg-secondary/30">
            <div className="container mx-auto max-w-2xl">
              {searchError && (
                <Card className="border-destructive">
                  <CardContent className="pt-6 flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p>{searchError}</p>
                  </CardContent>
                </Card>
              )}
              
              {searchResult?.type === 'queue' && (
                <QueueStatusCard
                  queue={searchResult.data.queue}
                  position={searchResult.data.position}
                  estimatedWaitTime={searchResult.data.estimatedWaitTime}
                  patientName={searchResult.data.patient?.name}
                  departmentStatus={searchResult.data.departmentStatus}
                />
              )}

              {searchResult?.type === 'phone' && searchResult.data.activeQueues?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Active Queues for {searchResult.data.patient?.name}
                  </h3>
                  {searchResult.data.activeQueues.map((queue: any) => (
                    <Card key={queue.queueNumber} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{queue.queueNumber}</p>
                          <p className="text-sm text-muted-foreground">{queue.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{queue.status}</p>
                          <p className="text-xs text-muted-foreground">
                            ~{queue.estimatedWaitTime} {t('minutes')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Quick Access</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/check-in')}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{t('checkIn')}</CardTitle>
                  <CardDescription>Get your queue number</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/display')}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{t('display')}</CardTitle>
                  <CardDescription>View current queue status</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 bg-primary/5" onClick={() => navigate('/appointment')}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                    <CalendarDays className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-primary">Book Appointment</CardTitle>
                  <CardDescription>New patient registration</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/login')}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-slate-600" />
                  </div>
                  <CardTitle>Staff Portal</CardTitle>
                  <CardDescription>Doctor & Tech Access</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-4xl font-bold text-primary">8</div>
                <p className="text-muted-foreground">Departments</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">50+</div>
                <p className="text-muted-foreground">Daily Patients</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">15</div>
                <p className="text-muted-foreground">Avg. Wait (min)</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24/7</div>
                <p className="text-muted-foreground">Emergency</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
