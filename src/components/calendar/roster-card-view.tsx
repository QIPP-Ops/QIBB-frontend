"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, startOfDay } from "date-fns";
import { User, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Leave {
  _id: string;
  start: Date | string;
  end: Date | string;
  type: string;
}

interface Employee {
  empId: string;
  name: string;
  crew: string;
  role: string;
  leaves: Leave[];
}

interface RosterCardViewProps {
  employees: Employee[];
}

export default function RosterCardView({ employees }: RosterCardViewProps) {
  const today = startOfDay(new Date("2026-04-20")); // Based on system baseline

  const getCrewColor = (crew: string) => {
    switch(crew) {
      case 'A': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      case 'B': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'C': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'D': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 bg-card border rounded-2xl">
      {employees.map((emp, i) => {
        // Filter out past leaves to only show upcoming ones
        const upcomingLeaves = emp.leaves.filter(l => {
            const endDateStr = typeof l.end === 'string' ? l.end.split('T')[0] : format(new Date(l.end), "yyyy-MM-dd");
            return endDateStr >= format(today, "yyyy-MM-dd");
        }).sort((a, b) => {
            const aStartStr = typeof a.start === 'string' ? a.start.split('T')[0] : format(new Date(a.start), "yyyy-MM-dd");
            const bStartStr = typeof b.start === 'string' ? b.start.split('T')[0] : format(new Date(b.start), "yyyy-MM-dd");
            return aStartStr.localeCompare(bStartStr);
        });

        // Check for conflicts across upcoming leaves
        const hasAnyConflict = upcomingLeaves.some(l => {
             const startStr = typeof l.start === 'string' ? l.start.split('T')[0] : format(new Date(l.start), "yyyy-MM-dd");
             return employees.some(other => 
                other.empId !== emp.empId &&
                other.crew === emp.crew &&
                other.role === emp.role &&
                other.leaves.some(ol => {
                    const os = typeof ol.start === 'string' ? ol.start.split('T')[0] : format(new Date(ol.start), "yyyy-MM-dd");
                    const oe = typeof ol.end === 'string' ? ol.end.split('T')[0] : format(new Date(ol.end), "yyyy-MM-dd");
                    return startStr >= os && startStr <= oe;
                })
             );
        });

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={emp.empId}
          >
            <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow border-brand-lilac/20 relative group">
              {/* Top Banner */}
              <div className={`h-2 w-full ${hasAnyConflict ? 'bg-rose-500 animate-pulse' : 'bg-brand-lilac/50'}`} />
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-lilac/10 flex items-center justify-center border border-brand-lilac/20">
                      <User className="text-brand-lilac" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight text-brand-dark">{emp.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">ID: {emp.empId}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${getCrewColor(emp.crew)} font-bold px-2 py-0.5`}>
                    Crew {emp.crew}
                  </Badge>
                </div>

                <div className="text-sm font-semibold text-gray-700 mb-6 bg-gray-50/50 p-2 border rounded-lg inline-block self-start">
                  {emp.role}
                </div>

                <div className="mt-auto">
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                        <Clock size={12} />
                        Upcoming Leaves ({upcomingLeaves.length})
                    </h4>
                    
                    {upcomingLeaves.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No leaves scheduled.</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingLeaves.slice(0, 3).map((leave, idx) => {
                                const startStr = typeof leave.start === 'string' ? leave.start.split('T')[0] : format(new Date(leave.start), "yyyy-MM-dd");
                                const endStr = typeof leave.end === 'string' ? leave.end.split('T')[0] : format(new Date(leave.end), "yyyy-MM-dd");
                                
                                return (
                                    <div key={idx} className="flex flex-col gap-1 p-2 bg-brand-purple/5 border border-brand-lilac/20 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-brand-purple">
                                                {startStr}
                                            </span>
                                            {startStr !== endStr && (
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    to {endStr}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <Badge variant="secondary" className="text-[9px] h-4 pb-0 bg-white border border-gray-200">
                                                {leave.type}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            })}
                            {upcomingLeaves.length > 3 && (
                                <p className="text-[10px] text-brand-lilac text-center font-bold mt-2">
                                    +{upcomingLeaves.length - 3} more entries
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Conflict Overlay Banner */}
                {hasAnyConflict && (
                  <div className="absolute top-4 right-[-32px] rotate-45 bg-rose-500 text-white text-[10px] font-bold px-8 py-0.5 shadow-sm shadow-rose-500/50 flex items-center gap-1">
                    <AlertCircle size={10} /> CONFLICT
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
