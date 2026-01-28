import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { queueApi } from '@/lib/api';
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Users,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LabTechnicianDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pendingQueues, setPendingQueues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const { socket } = useSocket();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await queueApi.getPendingQueues();
      if (response.data.success) {
        setPendingQueues(response.data.data.queues);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending queues',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleApprove = async (queueId: string) => {
    setIsApproving(queueId);
    try {
      const response = await queueApi.approveQueue({ queueId });
      if (response.data.success) {
        toast({
          title: 'Queue Approved',
          description: 'Patient has been added to the main queue',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve queue',
        variant: 'destructive',
      });
    }
    setIsApproving(null);
  };

  const handleReject = async (queueId: string, reason: string = 'Invalid information') => {
    setIsRejecting(queueId);
    try {
      const response = await queueApi.rejectQueue({ queueId, reason });
      if (response.data.success) {
        toast({
          title: 'Queue Rejected',
          description: 'Patient has been notified',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject queue',
        variant: 'destructive',
      });
    }
    setIsRejecting(null);
  };

  useEffect(() => {
    fetchData();
    
    if (socket) {
      const handleUpdate = () => {
        fetchData();
      };

      socket.on('lab-queues:updated', handleUpdate);
      socket.on('queue:updated', handleUpdate);

      return () => {
        socket.off('lab-queues:updated', handleUpdate);
        socket.off('queue:updated', handleUpdate);
      };
    }
  }, [socket]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] py-3 px-3">
        <div className="container mx-auto space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold">Lab Technician Dashboard</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Review and approve patient queue requests
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading} className="w-fit">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">↻</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          <Card>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono">
                    {String(pendingQueues.length).padStart(4, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pending Approval
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono">
                    {String(0).padStart(4, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Approved Today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono">
                    {String(0).padStart(4, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rejected Today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono">
                    {String(0).padStart(4, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg. Process Time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Queues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              {pendingQueues.length} queues waiting for review
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px] lg:h-[500px] pr-2 lg:pr-4">
              {pendingQueues.length > 0 ? (
                <div className="space-y-3">
                  {pendingQueues.map((queue: any, index: number) => (
                    <div
                      key={queue.id}
                      className="p-3 lg:p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                          <span className="font-mono font-bold text-sm lg:text-lg">
                            {queue.queueNumber}
                          </span>
                          <Badge className={`${getPriorityColor(queue.priority)} text-xs`}>
                            {queue.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{queue.department}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-sm lg:text-lg mb-1">
                          {queue.patient?.user?.firstName} {queue.patient?.user?.lastName}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                          Card: {queue.patient?.cardNumber}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Phone: {queue.patient?.user?.phoneNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(queue.joinedAt), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                        <Button
                          onClick={() => handleApprove(queue.id)}
                          disabled={isApproving === queue.id || isRejecting === queue.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {isApproving === queue.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(queue.id)}
                          disabled={isApproving === queue.id || isRejecting === queue.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          {isRejecting === queue.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pending approvals</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        </div>
      </div>
    </MainLayout>
  );
}
