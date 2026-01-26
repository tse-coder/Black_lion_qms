import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DepartmentDisplay } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocket } from '@/contexts/SocketContext';
import { PriorityBadge } from '@/components/queue';
import { 
  Clock, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Megaphone,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DisplayPage() {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const [departments, setDepartments] = useState<DepartmentDisplay[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedQueue, setHighlightedQueue] = useState<string | null>(null);
  const previousServingRef = useRef<Map<string, string>>(new Map());

  // Voice Announcement Function
  const announcePatient = useCallback((queueNumber: string, department: string) => {
    if (!soundEnabled) return;
    
    // Use Web Speech API
    const message = new SpeechSynthesisUtterance(
      `Queue number ${queueNumber.split('').join(' ')}, please proceed to ${department}`
    );
    message.rate = 0.9;
    message.pitch = 1;
    window.speechSynthesis.speak(message);
  }, [soundEnabled]);

  const fetchDisplayData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await queueApi.getDisplay();
      if (response.data.success) {
        const newDepartments = response.data.data.departments;
        
        // Check for changes and trigger voice/highlight
        newDepartments.forEach((dept) => {
          const currentServing = dept.currentlyServing?.queueNumber;
          const prevServing = previousServingRef.current.get(dept.department);
          
          if (currentServing && currentServing !== prevServing) {
            setHighlightedQueue(currentServing);
            announcePatient(currentServing, dept.department);
            setTimeout(() => setHighlightedQueue(null), 5000);
            previousServingRef.current.set(dept.department, currentServing);
          }
        });
        
        setDepartments(newDepartments);
      }
    } catch (error) {
      console.error('Failed to fetch display data:', error);
    } finally {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }
  }, [announcePatient]);

  // Socket Listener for real-time updates
  useEffect(() => {
    if (socket) {
      const handleUpdate = (payload: any) => {
        console.log('[SOCKET] Update received:', payload);
        fetchDisplayData();
      };

      socket.on('display:updated', handleUpdate);
      socket.on('queue:updated', handleUpdate);
      socket.on('patient:called', handleUpdate);

      return () => {
        socket.off('display:updated', handleUpdate);
        socket.off('queue:updated', handleUpdate);
        socket.off('patient:called', handleUpdate);
      };
    }
  }, [socket, fetchDisplayData]);

  // Initial fetch
  useEffect(() => {
    fetchDisplayData();
  }, [fetchDisplayData]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] overflow-hidden flex flex-col font-sans">
      {/* Premium Header - Light Ticker Style */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 relative z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-2 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
            <img src="/logo.png" alt="Black Lion" className="h-10 object-contain" />
          </div>
          <div className="h-10 w-[1px] bg-gray-200 mx-2" />
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Black Lion Hospital <span className="text-[#1e293b] italic">Live Queue Display</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-[0.2em]">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Real-time System Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm font-mono text-gray-500">{format(lastUpdated, 'EEEE, MMMM do')}</p>
            <p className="text-2xl font-black font-mono tracking-widest text-[#1e293b]">
              {format(lastUpdated, 'HH:mm:ss')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-[#1e293b]"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-[#1e293b]"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid - Filled Side to Side */}
      <main className="flex-1 p-6 relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full auto-rows-fr">
          {departments.map((dept) => (
            <Card 
              key={dept.department} 
              className={`bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col shadow-md transition-all duration-700 ${
                highlightedQueue === dept.currentlyServing?.queueNumber 
                ? 'ring-4 ring-primary/20 border-primary scale-[1.02] z-30 shadow-xl' 
                : ''
              }`}
            >
              {/* Dept Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-black text-lg tracking-tight uppercase truncate max-w-[150px] text-[#1e293b]">
                    {dept.department}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Active</span>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500 font-bold">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Now Serving - Premium Callout */}
              <div className="p-6 flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-white">
                {highlightedQueue === dept.currentlyServing?.queueNumber && (
                   <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                )}
                
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.3em] mb-4">
                  NOW SERVING
                </p>
                
                {dept.currentlyServing ? (
                  <div className="text-center group">
                    <div className={`text-7xl font-black transition-all duration-500 ${
                      highlightedQueue === dept.currentlyServing.queueNumber 
                      ? 'text-primary scale-110 drop-shadow-sm' 
                      : 'text-[#1e293b]'
                    }`}>
                      {dept.currentlyServing.queueNumber}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-lg font-bold text-[#334155] truncate max-w-[250px]">
                        {dept.currentlyServing.patientName}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                         <Megaphone className="h-3 w-3 text-primary animate-bounce" />
                         <p className="text-xs text-primary font-bold uppercase tracking-widest">
                           {dept.currentlyServing.doctorName || 'Wait for Call'}
                         </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center opacity-10">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">No Active Patient</p>
                  </div>
                )}
              </div>

              {/* Waiting List - Stock Refresh Style */}
              <div className="bg-gray-50/80 p-5 mt-auto border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">In Queue</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                    {dept.statistics.totalWaiting} TOTAL
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                  {dept.waitingPatients.length > 0 ? (
                    dept.waitingPatients.map((patient) => (
                      <div 
                        key={patient.queueNumber}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black text-[#475569] group-hover:text-primary transition-colors">
                            {patient.queueNumber}
                          </span>
                          <div className="h-3 w-[1px] bg-gray-200" />
                          <span className="text-xs text-gray-500 truncate max-w-[100px]">
                            {patient.patientName}
                          </span>
                        </div>
                        <PriorityBadge priority={patient.priority} />
                      </div>
                    ))
                  ) : (
                    <div className="h-20 flex items-center justify-center border border-dashed border-gray-200 rounded-xl">
                      <p className="text-[10px] text-gray-300 uppercase font-bold">Queue Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Modern Ticker Footer */}
      <footer className="h-12 bg-primary flex items-center overflow-hidden whitespace-nowrap px-4 border-t border-white/10">
        <div className="flex items-center gap-4 bg-black/10 px-4 py-1 rounded-full mr-8">
          <Activity className="h-4 w-4 animate-spin-slow text-white" />
          <span className="text-xs font-black tracking-widest uppercase text-white">System Bulletin</span>
        </div>
        <div className="flex animate-marquee items-center gap-12 text-sm font-bold uppercase tracking-widest text-white">
          {departments.map((dept) => (
            <div key={dept.department} className="flex items-center gap-4">
              <span>{dept.department}</span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="h-3 w-3 text-white/70" />
                {dept.statistics.totalWaiting}
              </span>
              <div className="h-4 w-[1px] bg-white/20" />
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {departments.map((dept) => (
            <div key={`${dept.department}-dup`} className="flex items-center gap-4">
              <span>{dept.department}</span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="h-3 w-3 text-white/70" />
                {dept.statistics.totalWaiting}
              </span>
              <div className="h-4 w-[1px] bg-white/20" />
            </div>
          ))}
        </div>
      </footer>

      {/* CSS for Ticker Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-scale {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s infinite ease-in-out;
        }
        .queue-highlight {
           animation: border-glow 1.5s infinite alternate;
        }
        @keyframes border-glow {
          from { border-color: rgba(var(--primary), 0.5); box-shadow: 0 0 10px rgba(var(--primary), 0.2); }
          to { border-color: rgba(var(--primary), 1); box-shadow: 0 0 30px rgba(var(--primary), 0.6); }
        }
      `}</style>
    </div>
  );
}
