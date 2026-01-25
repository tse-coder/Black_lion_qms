import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DepartmentDisplay } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriorityBadge } from '@/components/queue';
import { Clock, RefreshCw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Simulated display data for when API is unavailable
const MOCK_DISPLAY_DATA: DepartmentDisplay[] = [
  {
    department: 'Cardiology',
    currentlyServing: {
      queueNumber: 'CARD-001',
      patientName: 'Abebe K.',
      doctorName: 'Dr. Solomon',
      serviceStartTime: new Date().toISOString(),
      estimatedDuration: 25,
    },
    waitingPatients: [
      { queueNumber: 'CARD-002', patientName: 'Tigist H.', priority: 'Medium', joinedAt: new Date().toISOString(), estimatedWaitTime: 15 },
      { queueNumber: 'CARD-003', patientName: 'Mohamed A.', priority: 'High', joinedAt: new Date().toISOString(), estimatedWaitTime: 30 },
    ],
    statistics: { totalWaiting: 2, currentlyInProgress: 1, averageWaitTime: 22, lastUpdated: new Date().toISOString() },
  },
  {
    department: 'Laboratory',
    currentlyServing: {
      queueNumber: 'LAB-015',
      patientName: 'Samuel T.',
      serviceStartTime: new Date().toISOString(),
    },
    waitingPatients: [
      { queueNumber: 'LAB-016', patientName: 'Almaz B.', priority: 'Low', joinedAt: new Date().toISOString(), estimatedWaitTime: 10 },
    ],
    statistics: { totalWaiting: 1, currentlyInProgress: 1, averageWaitTime: 12, lastUpdated: new Date().toISOString() },
  },
  {
    department: 'Pharmacy',
    currentlyServing: {
      queueNumber: 'PHR-042',
      patientName: 'Hana M.',
      serviceStartTime: new Date().toISOString(),
    },
    waitingPatients: [
      { queueNumber: 'PHR-043', patientName: 'Dawit G.', priority: 'Medium', joinedAt: new Date().toISOString(), estimatedWaitTime: 5 },
      { queueNumber: 'PHR-044', patientName: 'Sara K.', priority: 'Low', joinedAt: new Date().toISOString(), estimatedWaitTime: 10 },
      { queueNumber: 'PHR-045', patientName: 'Yonas A.', priority: 'Low', joinedAt: new Date().toISOString(), estimatedWaitTime: 15 },
    ],
    statistics: { totalWaiting: 3, currentlyInProgress: 1, averageWaitTime: 8, lastUpdated: new Date().toISOString() },
  },
  {
    department: 'Radiology',
    currentlyServing: {
      queueNumber: 'RAD-008',
      patientName: 'Kidist L.',
      serviceStartTime: new Date().toISOString(),
    },
    waitingPatients: [],
    statistics: { totalWaiting: 0, currentlyInProgress: 1, averageWaitTime: 20, lastUpdated: new Date().toISOString() },
  },
  {
    department: 'Emergency',
    currentlyServing: {
      queueNumber: 'EMR-003',
      patientName: 'Urgent Patient',
      serviceStartTime: new Date().toISOString(),
    },
    waitingPatients: [
      { queueNumber: 'EMR-004', patientName: 'Critical A.', priority: 'Urgent', joinedAt: new Date().toISOString(), estimatedWaitTime: 5 },
    ],
    statistics: { totalWaiting: 1, currentlyInProgress: 1, averageWaitTime: 10, lastUpdated: new Date().toISOString() },
  },
];

export default function DisplayPage() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<DepartmentDisplay[]>(MOCK_DISPLAY_DATA);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedQueue, setHighlightedQueue] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousQueuesRef = useRef<Map<string, string>>(new Map());

  // Create audio element for notification sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVosnrLjyplACBB7o8/FeF4TDoCdv81sShACap/EtF4sAFaeyaJHGABAoMqYMgAviMyLJAAskMuAFwAfjsmAEwAUh8yAEAAPhc2ADgALg86ACQAIgs+ACQAGgc+ACQAF');
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // Fetch display data
  const fetchDisplayData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Try to fetch from API
      const response = await fetch('http://localhost:3000/api/v1/api/queue/display');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.departments) {
          // Check for changes and highlight
          data.data.departments.forEach((dept: DepartmentDisplay) => {
            const prevQueue = previousQueuesRef.current.get(dept.department);
            const currentQueue = dept.currentlyServing?.queueNumber;
            
            if (currentQueue && prevQueue !== currentQueue) {
              setHighlightedQueue(currentQueue);
              playNotificationSound();
              setTimeout(() => setHighlightedQueue(null), 3000);
            }
            
            if (currentQueue) {
              previousQueuesRef.current.set(dept.department, currentQueue);
            }
          });
          
          setDepartments(data.data.departments);
        }
      }
    } catch (error) {
      // Use mock data if API fails - this is expected in demo mode
      console.log('Using mock display data');
    }
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [playNotificationSound]);

  // Poll every 5 seconds
  useEffect(() => {
    fetchDisplayData();
    const interval = setInterval(fetchDisplayData, 5000);
    return () => clearInterval(interval);
  }, [fetchDisplayData]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Black Lion Hospital QMS" 
              className="h-12 w-12 object-contain rounded-lg"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('appName')}</h1>
              <p className="text-sm opacity-80">{t('displayTitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{t('lastUpdated')}: {format(lastUpdated, 'HH:mm:ss')}</span>
              {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Queue Display Grid */}
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.department}
              className={`rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-300 ${
                highlightedQueue === dept.currentlyServing?.queueNumber
                  ? 'border-primary ring-4 ring-primary/20 queue-highlight'
                  : 'border-border'
              }`}
            >
              {/* Department Header */}
              <div className="bg-primary text-primary-foreground px-4 py-3">
                <h2 className="text-lg font-bold">{dept.department}</h2>
                <p className="text-xs opacity-80">
                  {dept.statistics.totalWaiting} {t('waiting')}
                </p>
              </div>

              {/* Now Serving */}
              <div className="bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{t('nowServing')}</p>
                {dept.currentlyServing ? (
                  <div
                    className={`text-center py-4 rounded-lg transition-all duration-300 ${
                      highlightedQueue === dept.currentlyServing.queueNumber
                        ? 'bg-primary/10 animate-pulse-scale'
                        : 'bg-accent'
                    }`}
                  >
                    <p className="text-4xl md:text-5xl font-bold text-primary">
                      {dept.currentlyServing.queueNumber}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dept.currentlyServing.patientName}
                    </p>
                    {dept.currentlyServing.doctorName && (
                      <p className="text-xs text-muted-foreground">
                        {dept.currentlyServing.doctorName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">{t('noPatients')}</p>
                  </div>
                )}
              </div>

              {/* Waiting List */}
              {dept.waitingPatients.length > 0 && (
                <div className="border-t px-4 py-3 bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('waiting')} ({dept.waitingPatients.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dept.waitingPatients.slice(0, 5).map((patient, idx) => (
                      <div
                        key={patient.queueNumber}
                        className="flex items-center justify-between text-sm bg-background rounded px-2 py-1"
                      >
                        <span className="font-medium">{patient.queueNumber}</span>
                        <PriorityBadge priority={patient.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-primary/10 backdrop-blur-sm py-2 px-4 text-center text-sm text-muted-foreground">
        Auto-refreshing every 5 seconds • {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </footer>
    </div>
  );
}
