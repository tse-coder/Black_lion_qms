import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from './QueueBadges';
import { Queue } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  queue: Queue;
  patientName?: string;
  estimatedWaitTime?: number;
}

export function TicketCard({
  queue,
  patientName,
  estimatedWaitTime,
}: TicketCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="ticket-container overflow-hidden border-2 border-primary/20 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="bg-primary text-primary-foreground pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight">{t('ticketGenerated')}</CardTitle>
          <CheckCircle className="h-6 w-6 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Queue Number - Large and prominent */}
        <div className="text-center py-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-widest">{t('yourQueueNumber')}</p>
          <div className="text-6xl font-black text-primary tracking-tighter">
            {queue.queueNumber}
          </div>
        </div>

        {/* Patient and Department Info */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          {patientName && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Patient</p>
              <p className="font-semibold text-gray-800">{patientName}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('department')}</p>
            <p className="font-semibold text-gray-800">{queue.department}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('serviceType')}</p>
            <p className="font-semibold text-gray-800">{queue.serviceType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('priority')}</p>
            <PriorityBadge priority={queue.priority} />
          </div>
        </div>

        {/* Status and Wait Time */}
        <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4 border border-secondary/50">
          <div className="flex items-center gap-2">
            <StatusBadge status={queue.status} />
          </div>
          {estimatedWaitTime !== undefined && (
            <div className="flex items-center gap-2 text-primary font-bold">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                ~{estimatedWaitTime} {t('minutes')}
              </span>
            </div>
          )}
        </div>

        {/* Joined At */}
        <div className="text-center text-xs text-muted-foreground py-2 border-y border-gray-100">
          <p className="font-medium">
            {t('joinedAt')}: {format(new Date(queue.joinedAt), 'PPp')}
          </p>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-balance leading-relaxed text-muted-foreground bg-gray-50 p-4 rounded-lg">
          <p className="italic">{t('pleaseWait')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
