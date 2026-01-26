import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocket } from '@/contexts/SocketContext';
import { queueApi, Queue, Priority } from '@/lib/api';
import { PriorityBadge } from '@/components/queue';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  PhoneCall,
  User,
  Loader2,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DoctorStats {
  totalWaiting: number;
  urgentCases: number;
  highPriority: number;
  averageWaitTime: number;
}

interface ActiveQueueData {
  department: string;
  currentPatient: Queue | null;
  waitingPatients: Queue[];
  statistics: DoctorStats;
  doctorId: string;
}

// Mock data for demo
const MOCK_DOCTOR_DATA: ActiveQueueData = {
  department: 'Cardiology',
  currentPatient: {
    id: '1',
    queueNumber: 'CARD-001',
    status: 'InProgress',
    serviceType: 'General Consultation',
    department: 'Cardiology',
    priority: 'Medium',
    joinedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    serviceStartTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    patient: {
      user: {
        firstName: 'Abebe',
        lastName: 'Kebede',
        phoneNumber: '+251911234567',
      },
    },
  },
  waitingPatients: [
    {
      id: '2',
      queueNumber: 'CARD-002',
      status: 'Waiting',
      serviceType: 'Specialist',
      department: 'Cardiology',
      priority: 'High',
      joinedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      patient: { user: { firstName: 'Tigist', lastName: 'Haile' } },
    },
    {
      id: '3',
      queueNumber: 'CARD-003',
      status: 'Waiting',
      serviceType: 'General Consultation',
      department: 'Cardiology',
      priority: 'Urgent',
      joinedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      patient: { user: { firstName: 'Mohamed', lastName: 'Hassan' } },
    },
    {
      id: '4',
      queueNumber: 'CARD-004',
      status: 'Waiting',
      serviceType: 'General Consultation',
      department: 'Cardiology',
      priority: 'Medium',
      joinedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      patient: { user: { firstName: 'Almaz', lastName: 'Bekele' } },
    },
    {
      id: '5',
      queueNumber: 'CARD-005',
      status: 'Waiting',
      serviceType: 'General Consultation',
      department: 'Cardiology',
      priority: 'Low',
      joinedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      patient: { user: { firstName: 'Samuel', lastName: 'Tadesse' } },
    },
  ],
  statistics: {
    totalWaiting: 4,
    urgentCases: 1,
    highPriority: 1,
    averageWaitTime: 16,
  },
  doctorId: 'doc-1',
};

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [data, setData] = useState<ActiveQueueData>(MOCK_DOCTOR_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Queue | null>(null);
  const [activeDept, setActiveDept] = useState<string>('');
  const { socket } = useSocket();


  // Fetch active queue data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await queueApi.getActive(activeDept);
      if (response.data.success) {
        setData({
          department: response.data.data.department,
          currentPatient: response.data.data.currentPatient || null,
          waitingPatients: response.data.data.waitingPatients,
          statistics: response.data.data.statistics,
          doctorId: response.data.data.doctorId,
        });
        if (!activeDept) {
           setActiveDept(response.data.data.department);
        }
      }
    } catch (error) {
      // Use mock data if API fails
      console.log('Using mock doctor data');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('queue:updated', (payload: any) => {
        if (payload.department === activeDept || !activeDept) {
          console.log('[SOCKET] Queue update received');
          fetchData();
        }
      });

      return () => {
        socket.off('queue:updated');
      };
    }
  }, [fetchData, socket, activeDept]);

  // Call next patient
  const handleCallNext = async () => {
    setIsCallingNext(true);
    try {
      const response = await queueApi.doctorCallNext(data.department);
      if (response.data.success) {
        toast({
          title: t('success'),
          description: t('patientCalled'),
        });
        fetchData();
      }
    } catch (error: any) {
      // Demo: simulate calling next patient
      if (data.waitingPatients.length > 0) {
        const nextPatient = data.waitingPatients[0];
        setData(prev => ({
          ...prev,
          currentPatient: { ...nextPatient, status: 'InProgress', serviceStartTime: new Date().toISOString() },
          waitingPatients: prev.waitingPatients.slice(1),
          statistics: {
            ...prev.statistics,
            totalWaiting: prev.statistics.totalWaiting - 1,
          },
        }));
        toast({
          title: t('success'),
          description: `${nextPatient.patient?.user.firstName} has been called`,
        });
      } else {
        toast({
          title: 'No patients',
          description: 'There are no patients waiting',
          variant: 'destructive',
        });
      }
    }
    setIsCallingNext(false);
  };

  // Complete current patient
  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await queueApi.complete();
      if (response.data.success) {
        toast({
          title: t('success'),
          description: t('patientCompleted'),
        });
        fetchData();
      }
    } catch (error: any) {
      // Demo: simulate completing patient
      if (data.currentPatient) {
        toast({
          title: t('success'),
          description: `${data.currentPatient.patient?.user.firstName}'s consultation completed`,
        });
        setData(prev => ({
          ...prev,
          currentPatient: null,
        }));
      }
    }
    setIsCompleting(false);
  };

  // Sort waiting patients by priority
  const sortedWaitingPatients = [...data.waitingPatients].sort((a, b) => {
    const priorityOrder: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <MainLayout title="Doctor Dashboard">
      <div className="min-h-[calc(100vh-4rem)] py-6 px-4">
        <div className="container mx-auto">
          {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('doctorDashboard')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack')}, Dr. {user?.firstName} {user?.lastName}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
             <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Active Department</span>
             <Select value={activeDept} onValueChange={setActiveDept}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-primary/20 focus:ring-primary/20">
                  <SelectValue placeholder="Select Dept" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="General Consultation">General Medicine</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
      </div>     {/* Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.totalWaiting}</p>
                    <p className="text-sm text-muted-foreground">{t('totalWaiting')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={data.statistics.urgentCases > 0 ? 'border-priority-urgent' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-priority-urgent/10 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-priority-urgent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.urgentCases}</p>
                    <p className="text-sm text-muted-foreground">{t('urgentCases')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-priority-high/10 rounded-full">
                    <Activity className="h-6 w-6 text-priority-high" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.statistics.highPriority}</p>
                    <p className="text-sm text-muted-foreground">{t('highPriorityCases')}</p>
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
            {/* Waiting Patients List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('waitingPatients')}
                </CardTitle>
                <CardDescription>
                  {sortedWaitingPatients.length} patients in queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {sortedWaitingPatients.length > 0 ? (
                    <div className="space-y-3">
                      {sortedWaitingPatients.map((patient, index) => (
                        <div
                          key={patient.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedPatient?.id === patient.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-secondary/50'
                          }`}
                          onClick={() => setSelectedPatient(patient)}
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
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>{t('noWaitingPatients')}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Currently Serving */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('currentlyServing')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.currentPatient ? (
                  <div className="space-y-6">
                    {/* Patient Info */}
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
                          <p className="text-muted-foreground">{t('serviceType')}</p>
                          <p className="font-medium">{data.currentPatient.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('department')}</p>
                          <p className="font-medium">{data.currentPatient.department}</p>
                        </div>
                        {data.currentPatient.patient?.user.phoneNumber && (
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{data.currentPatient.patient.user.phoneNumber}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Service Started</p>
                          <p className="font-medium">
                            {data.currentPatient.serviceStartTime
                              ? formatDistanceToNow(new Date(data.currentPatient.serviceStartTime), { addSuffix: true })
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
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
                        {t('completePatient')}
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
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('noCurrentPatient')}</h3>
                    <p className="text-muted-foreground mb-6">
                      Click "Call Next" to serve the next patient in queue
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
