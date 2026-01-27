import React, { useState, useEffect, useRef, useCallback } from "react";
import { DepartmentDisplay, queueApi } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { announcePatient as audixaAnnounce } from "@/lib/audixa";
import {
  Clock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Activity,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  // Set document title
  useEffect(() => {
    document.title = t("publicDisplayTitle");
  }, []);

  // Voice Announcement Function (Audixa)
  const announcePatient = useCallback(
    async (queueNumber: string, department: string) => {
      if (!soundEnabled) return;

      console.log(
        `[TTS] Requesting announcement for ${queueNumber} via Audixa`,
      );
      await audixaAnnounce(queueNumber, department);
    },
    [soundEnabled],
  );

  const fetchDisplayData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await queueApi.getDisplay();
      if (response.data.success) {
        const newDepartments = response.data.data.departments;

        // Check for changes and trigger voice/highlight
        newDepartments.forEach((dept: DepartmentDisplay) => {
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
      console.error("Failed to fetch display data:", error);
    } finally {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }
  }, [announcePatient]);

  // Socket Listener for real-time updates
  useEffect(() => {
    if (socket) {
      const handleUpdate = (payload: any) => {
        console.log("[SOCKET] Update received:", payload);
        fetchDisplayData();
      };

      socket.on("display:updated", handleUpdate);
      socket.on("queue:updated", handleUpdate);
      socket.on("patient:called", handleUpdate);

      return () => {
        socket.off("display:updated", handleUpdate);
        socket.off("queue:updated", handleUpdate);
        socket.off("patient:called", handleUpdate);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10">
      {/* Professional Hospital Header */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-3 relative z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-card p-0.5 border border-border shadow-sm">
            <img
              src="/logo.png"
              alt="Black Lion"
              className="h-6 object-contain"
            />
          </div>
          <div className="h-5 w-[1px] bg-border mx-1" />
          <div>
            <h1 className="text-base font-black tracking-tighter uppercase italic text-foreground flex items-center gap-2">
              {t("appName")}{" "}
              <span className="text-primary">{t("medicalQueueStatus")}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right border-l border-border pl-6">
            <p className="text-[14px] font-black font-mono tracking-tighter text-foreground leading-none">
              {format(lastUpdated, "HH:mm:ss")}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid - Hospital Industrial Style */}
      <main className="flex-1 p-[1px] relative z-10 bg-border overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] h-full">
          {departments.map((dept: DepartmentDisplay) => (
            <div
              key={dept.department}
              className={`bg-card overflow-hidden flex flex-col transition-all duration-500 relative min-h-[400px] lg:min-h-0 ${
                highlightedQueue === dept.currentlyServing?.queueNumber
                  ? "z-30 ring-inset ring-4 ring-primary shadow-2xl"
                  : "shadow-sm"
              }`}
            >
              {/* Dept Header */}
              <div
                className={`px-2 py-1.5 flex items-center justify-between border-b border-border ${
                  highlightedQueue === dept.currentlyServing?.queueNumber
                    ? "bg-primary text-white font-black"
                    : "bg-muted text-foreground"
                }`}
              >
                <h3 className="font-black text-sm md:text-base tracking-widest uppercase truncate">
                  {dept.department}
                </h3>
                <Activity
                  className={`h-3 w-3 opacity-60 ${highlightedQueue === dept.currentlyServing?.queueNumber ? "animate-pulse" : ""}`}
                />
              </div>

              {/* Now Serving - One Line Compact Focus */}
              <div
                className={`px-2 py-2 border-b border-border transition-colors ${
                  highlightedQueue === dept.currentlyServing?.queueNumber
                    ? "bg-primary/5"
                    : "bg-card"
                }`}
              >
                {dept.currentlyServing ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                        {t("current")}
                      </p>
                      <p className="text-3xl font-black text-foreground tracking-tighter leading-none mt-1">
                        {dept.currentlyServing.queueNumber}
                      </p>
                    </div>
                    <div className="text-right flex-1 ml-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 truncate">
                        {dept.currentlyServing.patientName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between opacity-20">
                    <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase italic">
                      {t("standby")}
                    </p>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Waiting List - Maximized Height */}
              <div className="flex-1 flex flex-col bg-muted/30 min-h-0">
                <div className="px-2 py-1 flex items-center justify-between bg-muted/30 border-b border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    {t("waitingList")}
                  </span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest font-mono">
                    {String(dept.statistics.totalWaiting).padStart(4, "0")}{" "}
                    {t("patientsCount")}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide bg-card/50">
                  {dept.waitingPatients.length > 0 ? (
                    dept.waitingPatients.map((patient: any) => (
                      <div
                        key={patient.queueNumber}
                        className="group flex items-center justify-between border-b border-border px-2 py-1.5 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                            {patient.queueNumber}
                          </span>
                          <span className="text-xs font-bold text-[#94a3b8] uppercase truncate max-w-[150px]">
                            {patient.patientName}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 border ${
                            patient.priority === "Urgent"
                              ? "bg-red-50 text-red-500 border-red-100"
                              : patient.priority === "High"
                                ? "bg-orange-50 text-orange-500 border-orange-100"
                                : "bg-blue-50 text-primary border-blue-100"
                          }`}
                        >
                          {patient.priority.toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-6 opacity-20">
                      <p className="text-[10px] uppercase font-black tracking-widest italic text-muted-foreground">
                        {t("sectionClear")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Ticker Footer */}
      <footer className="h-10 bg-primary flex items-center overflow-hidden whitespace-nowrap border-t border-white/10 relative z-20 shrink-0">
        <div className="flex items-center gap-3 bg-black/40 h-full px-5 relative z-10 border-r border-white/10">
          <Activity className="h-3.5 w-3.5 animate-spin-slow text-white" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
            {t("bulletin")}
          </span>
        </div>
        <div className="flex animate-marquee items-center gap-12 text-sm font-bold uppercase tracking-widest text-white">
          {departments.map((dept: DepartmentDisplay) => (
            <div key={dept.department} className="flex items-center gap-4">
              <span>{dept.department}</span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="h-3 w-3 text-white/70" />
                {String(dept.statistics.totalWaiting).padStart(4, "0")}
              </span>
              <div className="h-4 w-[1px] bg-white/20" />
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {departments.map((dept: DepartmentDisplay) => (
            <div
              key={`${dept.department}-dup`}
              className="flex items-center gap-4"
            >
              <span>{dept.department}</span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="h-3 w-3 text-white/70" />
                {String(dept.statistics.totalWaiting).padStart(4, "0")}
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
