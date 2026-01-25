import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { queueApi, Priority, ServiceType } from '@/lib/api';
import { TicketCard } from '@/components/queue';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
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

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function CheckInPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    department: '',
    serviceType: '' as ServiceType | '',
    priority: 'Medium' as Priority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardNumber || !formData.department || !formData.serviceType) {
      toast({
        title: t('error'),
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await queueApi.request({
        cardNumber: formData.cardNumber,
        department: formData.department,
        serviceType: formData.serviceType as ServiceType,
        priority: formData.priority,
      });

      if (response.data.success) {
        setTicketData(response.data.data);
        toast({
          title: t('success'),
          description: t('queueCreated'),
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('networkError');
      toast({
        title: t('error'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTicketData(null);
    setFormData({
      cardNumber: '',
      department: '',
      serviceType: '',
      priority: 'Medium',
    });
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="container mx-auto max-w-md">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Link>
          </Button>

          {!ticketData ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('checkInTitle')}</CardTitle>
                <CardDescription>{t('checkInDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">{t('cardNumber')} *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="e.g., CARD-001"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Test cards: CARD-001, CARD-002, CARD-003, CARD-004, CARD-005
                    </p>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="department">{t('selectDepartment')} *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t('selectDepartment')} />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">{t('selectServiceType')} *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value as ServiceType })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t('selectServiceType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">{t('selectPriority')}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t('selectPriority')} />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
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
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t('loading')}
                      </>
                    ) : (
                      t('getTicket')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <TicketCard
                queue={ticketData.queue}
                patientName={ticketData.patientInfo?.name}
                estimatedWaitTime={ticketData.estimatedWaitTime}
              />
              <Button variant="outline" onClick={handleReset} className="w-full">
                Get Another Ticket
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
