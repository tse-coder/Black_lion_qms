import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriorityBadge, StatusBadge } from '@/components/queue';
import {
  Users,
  Activity,
  Clock,
  Building2,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  Bell,
  BarChart3,
  Settings,
  Stethoscope,
  FlaskConical,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { adminApi, userApi, notificationApi, queueApi, User as SystemUser, UserRole, ActivityLog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    totalQueues: 0,
    activeQueues: 0,
    departments: 0,
    todayVisits: 0,
    departmentStats: []
  });
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeQueues, setActiveQueues] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const { socket } = useSocket();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, notifRes, queueRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        userApi.getAll(),
        notificationApi.getHistory(),
        queueApi.getQueues(),
        adminApi.getActivityLogs({ limit: 10 })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data.users);
      if (notifRes.data.success) setNotifications(notifRes.data.data.notifications);
      if (queueRes.data.success) setActiveQueues(queueRes.data.data.queues);
      if (activityRes.data.success) setActivityLogs(activityRes.data.data.activities);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync with server',
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    if (socket) {
      const handleActivity = (newLog: ActivityLog) => {
        setActivityLogs(prev => [newLog, ...prev.slice(0, 9)]);
        // Also refresh stats since an activity usually means something changed
        fetchData();
      };

      const handleQueueUpdate = () => {
        fetchData();
      };

      socket.on('activity:new', handleActivity);
      socket.on('queue:updated', handleQueueUpdate);
      socket.on('display:updated', handleQueueUpdate);

      return () => {
        socket.off('activity:new', handleActivity);
        socket.off('queue:updated', handleQueueUpdate);
        socket.off('display:updated', handleQueueUpdate);
      };
    }

    const interval = setInterval(fetchData, 60000); // Less frequent polling when socket is active
    return () => clearInterval(interval);
  }, [socket]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Doctor':
        return <Stethoscope className="h-4 w-4" />;
      case 'Lab Technician':
        return <FlaskConical className="h-4 w-4" />;
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout title="Admin Dashboard">
      <div className="min-h-[calc(100vh-4rem)] py-6 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('adminDashboard')}</h1>
              <p className="text-muted-foreground">
                System Administration • {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">{t('totalUsers')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <UserCheck className="h-8 w-8 text-status-complete mb-2" />
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Activity className="h-8 w-8 text-status-in-progress mb-2" />
                  <p className="text-2xl font-bold">{stats.activeQueues}</p>
                  <p className="text-xs text-muted-foreground">{t('activeQueues')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Building2 className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats.departments}</p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Clock className="h-8 w-8 text-status-waiting mb-2" />
                  <p className="text-2xl font-bold">{stats.totalQueues}</p>
                  <p className="text-xs text-muted-foreground">Total Queues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats.todayVisits}</p>
                  <p className="text-xs text-muted-foreground">{t('todayVisits')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('systemOverview')}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                {t('userManagement')}
              </TabsTrigger>
              <TabsTrigger value="queues" className="gap-2">
                <Activity className="h-4 w-4" />
                {t('queueManagement')}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                {t('notifications')}
              </TabsTrigger>
            </TabsList>

            {/* System Overview */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('allDepartments')}</CardTitle>
                    <CardDescription>Queue status by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {stats.departmentStats?.length > 0 ? stats.departmentStats.map((dept: any) => (
                          <div key={dept.department} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{dept.department}</h4>
                              <Badge variant="outline">
                                {(parseInt(dept.waiting) + parseInt(dept.inProgress))} active
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                              <div className="p-2 bg-status-waiting/10 rounded">
                                <p className="font-bold text-status-waiting">{dept.waiting || 0}</p>
                                <p className="text-xs text-muted-foreground">Waiting</p>
                              </div>
                              <div className="p-2 bg-status-in-progress/10 rounded">
                                <p className="font-bold text-status-in-progress">{dept.inProgress || 0}</p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                              </div>
                              <div className="p-2 bg-status-complete/10 rounded">
                                <p className="font-bold text-status-complete">{dept.completed || 0}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-20 text-muted-foreground italic">
                             No data for any departments yet today.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLogs.length > 0 ? activityLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                          <div className={`p-2 rounded-full ${
                            log.type === 'AUTH' ? 'bg-primary/10' : 
                            log.type === 'QUEUE' ? 'bg-status-in-progress/10' : 
                            'bg-accent/10'
                          }`}>
                            {log.type === 'AUTH' ? <UserIcon className="h-4 w-4 text-primary" /> : 
                             log.type === 'QUEUE' ? <Activity className="h-4 w-4 text-status-in-progress" /> : 
                             <Bell className="h-4 w-4 text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.metadata?.department ? `${log.metadata.department} • ` : ''}
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 text-muted-foreground italic">
                          No recent activity logs.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t('userManagement')}</CardTitle>
                      <CardDescription>Manage system users and roles</CardDescription>
                    </div>
                    
                    {/* Add User Dialog */}
                    <AddUserDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.firstName} {u.lastName}</p>
                              <p className="text-sm text-muted-foreground">@{u.username} • {u.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(u.role)}
                              <span>{u.role}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isActive ? 'default' : 'secondary'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                           <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                              No users found in the system.
                           </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Queue Management */}
            <TabsContent value="queues">
              <Card>
                <CardHeader>
                  <CardTitle>{t('queueManagement')}</CardTitle>
                  <CardDescription>View and manage all active queues</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Queue #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeQueues.length > 0 ? activeQueues.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-mono font-bold">{q.queueNumber}</TableCell>
                          <TableCell>{q.patient?.user?.firstName} {q.patient?.user?.lastName}</TableCell>
                          <TableCell>{q.department}</TableCell>
                          <TableCell><PriorityBadge priority={q.priority} /></TableCell>
                          <TableCell><StatusBadge status={q.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground text-nowrap">
                             {formatDistanceToNow(new Date(q.joinedAt), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic">
                            No active queues at the moment.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Notification History</CardTitle>
                      <CardDescription>SMS and system notifications log</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell>
                            <Badge variant="outline">{notif.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{notif.recipient}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{notif.message}</TableCell>
                          <TableCell>
                            <Badge variant={notif.status === 'sent' ? 'default' : 'destructive'}>
                              {notif.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(notif.sentAt), 'HH:mm:ss')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

function AddUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: 'Doctor' as UserRole,
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await adminApi.createUser(formData);
      if (res.data.success) {
        toast({ title: 'Success', description: 'User created successfully' });
        setOpen(false);
        onSuccess();
        setFormData({
            firstName: '', lastName: '', username: '', email: '',
            phoneNumber: '', role: 'Doctor', password: ''
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
           <UserPlus className="h-4 w-4" />
           Add System User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Staff/User</DialogTitle>
          <DialogDescription>
            Create accounts for Doctors, Lab Technicians, or Admins.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                required 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                required 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                required 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              required 
              placeholder="+2519..."
              value={formData.phoneNumber} 
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v: any) => setFormData({...formData, role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input 
                type="password" 
                required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
