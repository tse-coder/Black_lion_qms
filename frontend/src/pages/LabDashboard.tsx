import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { queueApi, Queue } from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';
import { PriorityBadge } from '@/components/queue';
import { useToast } from '@/hooks/use-toast';
import {
  FlaskConical,
  Users,
  Clock,
  CheckCircle,
  PhoneCall,
  User,
  Loader2,
  RefreshCw,
  TestTube,
  FileCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock lab data
interface LabData {
  department: string;
  currentPatient: Queue | null;
  waitingPatients: Queue[];
  statistics: {
    totalWaiting: number;
    pendingTests: number;
    completedToday: number;
    averageWaitTime: number;
  };
}

const MOCK_LAB_DATA: LabData = {
  department: 'Laboratory',
  currentPatient: {
    id: '1',
    queueNumber: 'LAB-015',
    status: 'InProgress' as const,
    serviceType: 'Laboratory' as const,
    department: 'Laboratory',
    priority: 'Medium' as const,
    joinedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    serviceStartTime: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    patient: {
      user: {
        firstName: 'Samuel',
        lastName: 'Tadesse',
        phoneNumber: '+251912345678',
      },
    },
  },
  waitingPatients: [
    {
      id: '2',
      queueNumber: 'LAB-016',
      status: 'Waiting' as const,
      serviceType: 'Laboratory' as const,
      department: 'Laboratory',
      priority: 'Low' as const,
      joinedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      patient: { user: { firstName: 'Almaz', lastName: 'Bekele' } },
    },
    {
      id: '3',
      queueNumber: 'LAB-017',
      status: 'Waiting' as const,
      serviceType: 'Laboratory' as const,
      department: 'Laboratory',
      priority: 'High' as const,
      joinedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      patient: { user: { firstName: 'Hana', lastName: 'Mulugeta' } },
    },
    {
      id: '4',
      queueNumber: 'LAB-018',
      status: 'Waiting' as const,
      serviceType: 'Laboratory' as const,
      department: 'Laboratory',
      priority: 'Medium' as const,
      joinedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      patient: { user: { firstName: 'Dawit', lastName: 'Girma' } },
    },
  ],
  statistics: {
    totalWaiting: 3,
    pendingTests: 12,
    completedToday: 28,
    averageWaitTime: 10,
  },
};

export default function LabDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [data, setData] = useState<LabData>({
    department: 'Laboratory',
    currentPatient: null,
    waitingPatients: [],
    statistics: {
      totalWaiting: 0,
      pendingTests: 0,
      completedToday: 0,
      averageWaitTime: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { socket } = useSocket();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await queueApi.getActive('Laboratory');
      if (response.data.success) {
        setData({
          department: response.data.data.department,
          currentPatient: response.data.data.currentPatient || null,
          waitingPatients: response.data.data.waitingPatients,
          statistics: {
            totalWaiting: response.data.data.statistics.totalWaiting,
            pendingTests: response.data.data.statistics.totalWaiting, // Map total waiting to pending
            completedToday: 0, // Stats need more backend support for "today"
            averageWaitTime: response.data.data.statistics.averageWaitTime,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch lab data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    
    if (socket) {
      const handleUpdate = (payload: any) => {
        if (payload.department === 'Laboratory' || !payload.department) {
          fetchData();
        }
      };

      socket.on('queue:updated', handleUpdate);
      socket.on('display:updated', handleUpdate);

      return () => {
        socket.off('queue:updated', handleUpdate);
        socket.off('display:updated', handleUpdate);
      };
    }

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData, socket]);

  const handleCallNext = async () => {
    setIsCallingNext(true);
    try {
      const response = await queueApi.doctorCallNext('Laboratory');
      if (response.data.success) {
        toast({
          title: 'Patient Called',
          description: `Patient has been called for testing`,
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to call next patient',
        variant: 'destructive',
      });
    }
    setIsCallingNext(false);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await queueApi.complete();
      if (response.data.success) {
        toast({
          title: 'Test Completed',
          description: `Lab test completed successfully`,
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete test',
        variant: 'destructive',
      });
    }
    setIsCompleting(false);
  };

  // Sort by priority
  const sortedWaitingPatients = [...data.waitingPatients].sort((a, b) => {
    const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <MainLayout title="Lab Dashboard">
      <div className="min-h-[calc(100vh-4rem)] py-6 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('labDashboard')}</h1>
              <p className="text-muted-foreground">
                Laboratory • {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.totalWaiting}</p>
                    <p className="text-sm text-muted-foreground">{t('waiting')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-status-waiting/10 rounded-full">
                    <TestTube className="h-6 w-6 text-status-waiting" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.pendingTests}</p>
                    <p className="text-sm text-muted-foreground">{t('pendingTests')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-status-complete/10 rounded-full">
                    <FileCheck className="h-6 w-6 text-status-complete" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.completedToday}</p>
                    <p className="text-sm text-muted-foreground">{t('completedTests')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.averageWaitTime}m</p>
                    <p className="text-sm text-muted-foreground">{t('avgWaitTime')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Waiting List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  {t('labQueue')}
                </CardTitle>
                <CardDescription>
                  {sortedWaitingPatients.length} patients waiting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {sortedWaitingPatients.length > 0 ? (
                    <div className="space-y-3">
                      {sortedWaitingPatients.map((patient, index) => (
                        <div
                          key={patient.id}
                          className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{patient.queueNumber}</span>
                              <PriorityBadge priority={patient.priority} />
                            </div>
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          </div>
                          <p className="font-medium">
                            {patient.patient?.user.firstName} {patient.patient?.user.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(patient.joinedAt), { addSuffix: true })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No patients waiting</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Currently Testing */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Currently Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.currentPatient ? (
                  <div className="space-y-6">
                    <div className="bg-accent rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-4xl font-bold text-primary">
                            {data.currentPatient.queueNumber}
                          </p>
                          <h3 className="text-2xl font-semibold mt-2">
                            {data.currentPatient.patient?.user.firstName}{' '}
                            {data.currentPatient.patient?.user.lastName}
                          </h3>
                        </div>
                        <PriorityBadge priority={data.currentPatient.priority} />
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Test Type</p>
                          <p className="font-medium">{data.currentPatient.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Started</p>
                          <p className="font-medium">
                            {data.currentPatient.serviceStartTime
                              ? formatDistanceToNow(new Date(data.currentPatient.serviceStartTime), { addSuffix: true })
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        size="lg"
                        className="flex-1 h-14"
                        variant="outline"
                        onClick={handleComplete}
                        disabled={isCompleting}
                      >
                        {isCompleting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        )}
                        Complete Test
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 h-14"
                        onClick={handleCallNext}
                        disabled={isCallingNext || sortedWaitingPatients.length === 0}
                      >
                        {isCallingNext ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <PhoneCall className="h-5 w-5 mr-2" />
                        )}
                        {t('callNext')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <FlaskConical className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No patient currently being tested</h3>
                    <p className="text-muted-foreground mb-6">
                      Click "Call Next" to start testing the next patient
                    </p>
                    <Button
                      size="lg"
                      onClick={handleCallNext}
                      disabled={isCallingNext || sortedWaitingPatients.length === 0}
                    >
                      {isCallingNext ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <PhoneCall className="h-5 w-5 mr-2" />
                      )}
                      {t('callNext')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
