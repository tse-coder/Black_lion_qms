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
import { queueApi, Priority, ServiceType } from '@/lib/api';
import { TicketCard } from '@/components/queue';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ClipboardCheck, Sparkles } from 'lucide-react';
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

const SERVICE_TYPES: ServiceType[] = [
  'General Consultation',
  'Specialist',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'Emergency',
];

const checkInSchema = z.object({
  cardNumber: z.string().min(3, 'Card number must be at least 3 characters'),
  department: z.string().min(1, 'Please select a department'),
  serviceType: z.string().min(1, 'Please select a service type'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export default function CheckInPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [ticketData, setTicketData] = useState<any>(null);
  
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      cardNumber: '',
      department: '',
      serviceType: '',
      priority: 'Medium',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CheckInFormValues) => {
    try {
      const response = await queueApi.request({
        cardNumber: values.cardNumber,
        department: values.department,
        serviceType: values.serviceType as ServiceType,
        priority: values.priority,
      });

      if (response.data.success) {
        setTicketData(response.data.data);
        toast({
          title: t('success'),
          description: t('queueCreated'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.response?.data?.message || t('networkError'),
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setTicketData(null);
    form.reset();
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-md">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6 hover:bg-white/50 backdrop-blur-sm transition-all">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Link>
          </Button>

          {!ticketData ? (
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-extrabold tracking-tight">{t('checkInTitle')}</CardTitle>
                <CardDescription className="text-base">{t('checkInDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Card Number */}
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-wider">{t('cardNumber')} *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., CARD-001"
                              {...field}
                              className="h-12 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                          </FormControl>
                          <p className="text-[10px] text-muted-foreground italic mt-1">
                            Test cards: CARD-001 to CARD-005
                          </p>
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
                          <FormLabel className="text-sm font-bold uppercase tracking-wider">{t('selectDepartment')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder={t('selectDepartment')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Service Type */}
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-wider">{t('selectServiceType')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder={t('selectServiceType')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SERVICE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-wider">{t('selectPriority')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder={t('selectPriority')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        priority === 'Urgent'
                                          ? 'bg-priority-urgent'
                                          : priority === 'High'
                                          ? 'bg-priority-high'
                                          : priority === 'Medium'
                                          ? 'bg-priority-medium'
                                          : 'bg-priority-low'
                                      }`}
                                    />
                                    {priority}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {t('loading')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          {t('getTicket')}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <TicketCard
                queue={ticketData.queue}
                patientName={ticketData.patientInfo?.name}
                estimatedWaitTime={ticketData.estimatedWaitTime}
              />
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="w-full h-12 font-semibold border-2 border-primary/20 hover:bg-primary/5 transition-all"
              >
                Get Another Ticket
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
