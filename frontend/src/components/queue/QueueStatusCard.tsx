import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Queue } from '@/lib/api';
import { PriorityBadge, StatusBadge } from './QueueBadges';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueStatusCardProps {
  queue: Queue;
  position?: number;
  estimatedWaitTime?: number;
  patientName?: string;
  departmentStatus?: {
    waitingCount: number;
    inProgressCount: number;
    totalActive: number;
  };
}

export function QueueStatusCard({
  queue,
  position,
  estimatedWaitTime,
  patientName,
  departmentStatus,
}: QueueStatusCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-accent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {t('queueNumber')}: {queue.queueNumber}
          </CardTitle>
          <StatusBadge status={queue.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Patient Name */}
        {patientName && (
          <div className="text-center pb-4 border-b">
            <p className="text-lg font-medium">{patientName}</p>
          </div>
        )}

        {/* Position and Wait Time */}
        <div className="grid grid-cols-2 gap-4">
          {position !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('position')}</p>
                <p className="text-xl font-bold">{position}</p>
              </div>
            </div>
          )}
          {estimatedWaitTime !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('estimatedWait')}</p>
                <p className="text-xl font-bold">{estimatedWaitTime} {t('minutes')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Queue Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div>
            <p className="text-muted-foreground">{t('joinedAt')}</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(queue.joinedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Department Status */}
        {departmentStatus && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Department Status</p>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-status-waiting">{departmentStatus.waitingCount}</p>
                <p className="text-xs text-muted-foreground">{t('waiting')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-status-in-progress">{departmentStatus.inProgressCount}</p>
                <p className="text-xs text-muted-foreground">{t('inProgress')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{departmentStatus.totalActive}</p>
                <p className="text-xs text-muted-foreground">Total Active</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
