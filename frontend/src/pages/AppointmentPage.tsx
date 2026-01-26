import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { appointmentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  ArrowRight, 
  Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEPARTMENTS = [
  'Cardiology',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'Emergency',
  'General Medicine',
  'Orthopedics',
  'Pediatrics',
];

const appointmentSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^\+251[9][0-9]{8}$/, 'Must be a valid Ethiopian phone number (+2519xxxxxxxx)'),
  department: z.string().min(1, 'Please select a department'),
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [result, setResult] = useState<{ cardNumber: string } | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '+2519',
      department: '',
      appointmentDate: '',
      appointmentTime: '',
      notes: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      const response = await appointmentApi.create(values as any);
      if (response.data.success) {
        setResult({ cardNumber: response.data.data.cardNumber });
        toast({
          title: "Appointment Booked!",
          description: `Your card number is ${response.data.data.cardNumber}`,
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.response?.data?.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Card number copied to clipboard",
    });
  };

  if (result) {
    return (
      <MainLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] py-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="text-center pt-10 px-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</CardTitle>
                <CardDescription className="text-slate-500 text-lg mt-2">
                  Your appointment has been registered in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-4">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Your Private Card Number</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black font-mono text-primary tracking-tighter">
                      {result.cardNumber}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(result.cardNumber)}
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-slate-400 text-xs text-center italic mt-2 px-4">
                    Please use this card number to check-in when you arrive at the hospital. 
                  </p>
                </div>
                
                <div className="mt-8 space-y-4">
                   <Button asChild className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
                     <Link to="/check-in">
                        Go to Check-in
                        <ArrowRight className="ml-2 h-5 w-5" />
                     </Link>
                   </Button>
                   <Button variant="outline" asChild className="w-full h-14 text-[#475569] font-bold border-slate-200">
                     <Link to="/">Back to Home</Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transform rotate-6">
              <Calendar className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Book Appointment</h1>
              <p className="text-slate-500 font-medium">Quick and easy registration for Black Lion Hospital</p>
            </div>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                <Sparkles className="w-5 h-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4" /> Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Abebe Kebede" {...field} className="h-12 border-slate-200 focus:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" /> Email Address (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="abebe@example.com" {...field} className="h-12 border-slate-200 focus:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" /> Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+251912345678" {...field} className="h-12 border-slate-200 focus:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Department */}
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <Activity className="w-4 h-4" /> Department
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-slate-200 focus:ring-primary/20">
                                <SelectValue placeholder="Select Department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" /> Preferred Date
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-12 border-slate-200 focus:ring-primary/20" min={new Date().toISOString().split('T')[0]} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Time */}
                    <FormField
                      control={form.control}
                      name="appointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" /> Preferred Time
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-12 border-slate-200 focus:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600">Additional Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe your symptoms or reason for visit..." {...field} className="h-12 border-slate-200 focus:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Appointment Now'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-slate-400 text-sm">
             Already have a card number? <Link to="/check-in" className="text-primary font-bold hover:underline">Go to Check-in</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
