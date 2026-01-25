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
  User,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock admin data
const MOCK_STATS = {
  totalUsers: 156,
  activeUsers: 142,
  totalQueues: 89,
  activeQueues: 23,
  departments: 8,
  todayVisits: 67,
};

const MOCK_DEPARTMENTS = [
  { name: 'Cardiology', waiting: 5, inProgress: 2, completed: 12 },
  { name: 'Laboratory', waiting: 8, inProgress: 3, completed: 28 },
  { name: 'Pharmacy', waiting: 12, inProgress: 2, completed: 45 },
  { name: 'Radiology', waiting: 3, inProgress: 1, completed: 8 },
  { name: 'Emergency', waiting: 2, inProgress: 2, completed: 15 },
  { name: 'General Medicine', waiting: 7, inProgress: 3, completed: 22 },
  { name: 'Orthopedics', waiting: 4, inProgress: 1, completed: 9 },
  { name: 'Pediatrics', waiting: 6, inProgress: 2, completed: 18 },
];

const MOCK_USERS = [
  { id: '1', name: 'Dr. Solomon Tesfaye', email: 'doctor@blacklion.com', role: 'Doctor', isActive: true, lastLogin: new Date().toISOString() },
  { id: '2', name: 'Nurse Tigist Haile', email: 'labtech@blacklion.com', role: 'Lab Technician', isActive: true, lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', name: 'Admin User', email: 'admin@blacklion.com', role: 'Admin', isActive: true, lastLogin: new Date().toISOString() },
  { id: '4', name: 'Abebe Kebede', email: 'patient@blacklion.com', role: 'Patient', isActive: true, lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '5', name: 'Mohamed Hassan', email: 'mohamed@example.com', role: 'Patient', isActive: false, lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'SMS', recipient: '+251911234567', message: 'Your queue number CARD-001 is ready', status: 'sent', sentAt: new Date().toISOString() },
  { id: '2', type: 'SMS', recipient: '+251912345678', message: 'Your queue number LAB-015 is ready', status: 'sent', sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '3', type: 'SMS', recipient: '+251913456789', message: 'Your queue number PHR-042 is ready', status: 'failed', sentAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const fetchData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Doctor':
        return <Stethoscope className="h-4 w-4" />;
      case 'Lab Technician':
        return <FlaskConical className="h-4 w-4" />;
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
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
                        {departments.map((dept) => (
                          <div key={dept.name} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{dept.name}</h4>
                              <Badge variant="outline">
                                {dept.waiting + dept.inProgress} active
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                              <div className="p-2 bg-status-waiting/10 rounded">
                                <p className="font-bold text-status-waiting">{dept.waiting}</p>
                                <p className="text-xs text-muted-foreground">Waiting</p>
                              </div>
                              <div className="p-2 bg-status-in-progress/10 rounded">
                                <p className="font-bold text-status-in-progress">{dept.inProgress}</p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                              </div>
                              <div className="p-2 bg-status-complete/10 rounded">
                                <p className="font-bold text-status-complete">{dept.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="p-2 bg-status-complete/10 rounded-full">
                          <UserCheck className="h-4 w-4 text-status-complete" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Patient CARD-001 completed</p>
                          <p className="text-xs text-muted-foreground">Cardiology - 2 mins ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="p-2 bg-status-in-progress/10 rounded-full">
                          <Activity className="h-4 w-4 text-status-in-progress" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Patient LAB-016 called</p>
                          <p className="text-xs text-muted-foreground">Laboratory - 5 mins ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New patient check-in</p>
                          <p className="text-xs text-muted-foreground">Emergency - 8 mins ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="p-2 bg-status-waiting/10 rounded-full">
                          <Bell className="h-4 w-4 text-status-waiting" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">SMS notification sent</p>
                          <p className="text-xs text-muted-foreground">+251911234567 - 10 mins ago</p>
                        </div>
                      </div>
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
                    <Button>Add User</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
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
                            {format(new Date(u.lastLogin), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                        <TableHead>Wait Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono font-bold">CARD-001</TableCell>
                        <TableCell>Abebe Kebede</TableCell>
                        <TableCell>Cardiology</TableCell>
                        <TableCell><PriorityBadge priority="Medium" /></TableCell>
                        <TableCell><StatusBadge status="InProgress" /></TableCell>
                        <TableCell>15 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono font-bold">CARD-002</TableCell>
                        <TableCell>Tigist Haile</TableCell>
                        <TableCell>Cardiology</TableCell>
                        <TableCell><PriorityBadge priority="High" /></TableCell>
                        <TableCell><StatusBadge status="Waiting" /></TableCell>
                        <TableCell>22 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono font-bold">LAB-015</TableCell>
                        <TableCell>Samuel Tadesse</TableCell>
                        <TableCell>Laboratory</TableCell>
                        <TableCell><PriorityBadge priority="Low" /></TableCell>
                        <TableCell><StatusBadge status="InProgress" /></TableCell>
                        <TableCell>8 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono font-bold">EMR-003</TableCell>
                        <TableCell>Urgent Patient</TableCell>
                        <TableCell>Emergency</TableCell>
                        <TableCell><PriorityBadge priority="Urgent" /></TableCell>
                        <TableCell><StatusBadge status="InProgress" /></TableCell>
                        <TableCell>2 min</TableCell>
                      </TableRow>
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
                    <Button>Send Notification</Button>
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
