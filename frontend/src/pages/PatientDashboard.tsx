import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { QueueStatusCard } from '@/components/queue';
import { queueApi, Queue } from '@/lib/api';
import {
  User,
  Clock,
  History,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';



export default function PatientDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [queueHistory, setQueueHistory] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await queueApi.getQueues();
      if (response.data.success) {
        const queues = response.data.data.queues;
        setActiveQueues(queues.filter((q: Queue) => q.status === 'Waiting' || q.status === 'InProgress'));
        setQueueHistory(queues.filter((q: Queue) => q.status === 'Complete' || q.status === 'Cancelled'));
      }
    } catch (error) {
      console.error('Failed to fetch patient queues:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    if (socket) {
      const handleQueueUpdate = () => {
        fetchData();
      };

      const handlePatientCalled = (payload: any) => {
        fetchData();
        // Show a more prominent notification if the patient is called
        alert(`You are being called! Please proceed to ${payload.department} to see ${payload.doctorName}.`);
      };

      socket.on('queue:updated', handleQueueUpdate);
      socket.on('patient:called', handlePatientCalled);
      socket.on('patient:completed', handleQueueUpdate);

      return () => {
        socket.off('queue:updated', handleQueueUpdate);
        socket.off('patient:called', handlePatientCalled);
        socket.off('patient:completed', handleQueueUpdate);
      };
    }

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [socket]);

  return (
    <MainLayout title="My Healthcare Dashboard">
      <div className="min-h-[calc(100vh-4rem)] py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('patientDashboard')}</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.phoneNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="gap-2">
                <Clock className="h-4 w-4" />
                {t('myQueues')} ({activeQueues.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                {t('queueHistory')}
              </TabsTrigger>
            </TabsList>

            {/* Active Queues */}
            <TabsContent value="active" className="space-y-4">
              {activeQueues.length > 0 ? (
                activeQueues.map((queue) => (
                  <QueueStatusCard
                    key={queue.id}
                    queue={queue}
                    estimatedWaitTime={queue.estimatedWaitTime}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Queues</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any active queue entries
                    </p>
                    <Button asChild>
                      <a href="/check-in">Get a New Ticket</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Queue History */}
            <TabsContent value="history" className="space-y-4">
              {queueHistory.length > 0 ? (
                queueHistory.map((queue) => (
                  <Card key={queue.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            queue.status === 'Complete' 
                              ? 'bg-status-complete/10' 
                              : 'bg-status-cancelled/10'
                          }`}>
                            {queue.status === 'Complete' ? (
                              <CheckCircle className="h-5 w-5 text-status-complete" />
                            ) : (
                              <XCircle className="h-5 w-5 text-status-cancelled" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono font-bold">{queue.queueNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {queue.department} - {queue.serviceType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{queue.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(queue.joinedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Queue History</h3>
                    <p className="text-muted-foreground">
                      Your past queue entries will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
