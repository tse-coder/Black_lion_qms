import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriorityBadge, StatusBadge } from './QueueBadges';
import { Queue } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Printer, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  queue: Queue;
  patientName?: string;
  estimatedWaitTime?: number;
  showActions?: boolean;
  onPrint?: () => void;
}

export function TicketCard({
  queue,
  patientName,
  estimatedWaitTime,
  showActions = true,
  onPrint,
}: TicketCardProps) {
  const { t } = useLanguage();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Card className="ticket-container overflow-hidden border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('ticketGenerated')}</CardTitle>
          <CheckCircle className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Queue Number - Large and prominent */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{t('yourQueueNumber')}</p>
          <div className="text-5xl font-bold text-primary tracking-wider">
            {queue.queueNumber}
          </div>
        </div>

        {/* Patient and Department Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {patientName && (
            <div>
              <p className="text-muted-foreground">Patient</p>
              <p className="font-medium">{patientName}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">{t('department')}</p>
            <p className="font-medium">{queue.department}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('serviceType')}</p>
            <p className="font-medium">{queue.serviceType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('priority')}</p>
            <PriorityBadge priority={queue.priority} />
          </div>
        </div>

        {/* Status and Wait Time */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={queue.status} />
          </div>
          {estimatedWaitTime !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                ~{estimatedWaitTime} {t('minutes')}
              </span>
            </div>
          )}
        </div>

        {/* Joined At */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('joinedAt')}: {format(new Date(queue.joinedAt), 'PPp')}
          </p>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>{t('pleaseWait')}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              {t('printTicket')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
