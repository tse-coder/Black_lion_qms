import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Settings, 
  Lock, 
  Stethoscope, 
  Loader2, 
  Save, 
  CheckCircle2,
  ShieldCheck,
  UserCog
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\+251[9][0-9]{8}$/, 'Invalid Ethiopian phone (+2519xxxxxxxx)'),
  // Patient fields
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().regex(/^\+251[9][0-9]{8}$/, 'Invalid Ethiopian phone').optional().or(z.literal('')),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const).optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.patientProfile?.address || '',
      emergencyContactName: user?.patientProfile?.emergencyContactName || '',
      emergencyContactPhone: user?.patientProfile?.emergencyContactPhone || '',
      bloodType: user?.patientProfile?.bloodType as any,
      allergies: user?.patientProfile?.allergies || '',
      chronicConditions: user?.patientProfile?.chronicConditions || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.patientProfile?.address || '',
        emergencyContactName: user.patientProfile?.emergencyContactName || '',
        emergencyContactPhone: user.patientProfile?.emergencyContactPhone || '',
        bloodType: user.patientProfile?.bloodType as any,
        allergies: user.patientProfile?.allergies || '',
        chronicConditions: user.patientProfile?.chronicConditions || '',
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const response = await authApi.updateProfile(values);
      if (response.data.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        await refreshUser();
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      const response = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response.data.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been successfully updated.',
        });
        passwordForm.reset();
      }
    } catch (error: any) {
      toast({
        title: 'Change Failed',
        description: error.response?.data?.message || 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <MainLayout title="Settings">
      <div className="container max-w-5xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className={`grid w-full ${user?.role === 'Patient' ? 'grid-cols-3' : 'grid-cols-2'} h-12 p-1 bg-muted/50 backdrop-blur-sm`}>
            <TabsTrigger value="profile" className="gap-2">
              <UserCog className="h-4 w-4" />
              Account
            </TabsTrigger>
            {user?.role === 'Patient' && (
              <TabsTrigger value="medical" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Medical Profile
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile} className="min-w-[120px]">
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'Patient' && (
            <TabsContent value="medical" className="space-y-6">
              <Card className="border-none shadow-xl bg-white/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Medical Profile</CardTitle>
                  <CardDescription>Manage your hospital-specific information and medical details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Home Address</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 transition-all focus:ring-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Phone</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergies</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="chronicConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chronic Conditions</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isUpdatingProfile} className="min-w-[120px]">
                          {isUpdatingProfile ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Update Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="security" className="space-y-6">
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is secure by using a strong password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="h-11 transition-all focus:ring-2 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isChangingPassword} className="min-w-[120px]">
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
