"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { rosterApi } from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { Alert } from "@/components/ui/alert";
import { saveAs } from "file-saver";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const SHIFT_CYCLES: Record<string, string[]> = {
  'A': ['O', 'O', 'O', 'O', 'D', 'D', 'N', 'N'],
  'B': ['D', 'D', 'N', 'N', 'O', 'O', 'O', 'O'],
  'C': ['N', 'N', 'O', 'O', 'O', 'O', 'D', 'D'],
  'D': ['O', 'O', 'D', 'D', 'N', 'N', 'O', 'O'],
  'General': ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
};

// Fixed base date for shift calculation
const BASE_DATE = new Date("2026-01-01T00:00:00Z");

interface Leave {
  start: string;
  end: string;
  type: "Applied on SAP" | "Planned";
}

interface Employee {
  _id?: string;
  empId: string;
  name: string;
  crew: string;
  role: string;
  leaves: Leave[];
}

interface RosterGridProps {
  employees: Employee[];
  onUpdate?: () => void;
}

export default function RosterCalendar({ employees, onUpdate }: RosterGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date("2026-04-20"));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [leaveType, setLeaveType] = useState<string>("Planned");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const canEdit = (emp: Employee) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // Direct match by Employee ID is the most reliable (Unified Model)
    if (user.empId && emp.empId && user.empId === emp.empId) return true;

    // Fallback name matching with safety checks
    const userPrefix = user.email?.split('@')[0]?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || "";
    const empNameNormalized = emp.name?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || "";
    
    if (!empNameNormalized || !userPrefix) return false;

    return empNameNormalized.includes(userPrefix) || userPrefix.includes(empNameNormalized);
  };

  const handleCellClick = (day: Date, emp: Employee, event: React.MouseEvent) => {
    if (!user) {
      toast.info("Read-only access: Sign in as Personnel to manage roster records.");
      return;
    }

    if (!canEdit(emp)) {
      toast.error("Permission Denied: You can only manage your own roster entries.");
      return;
    }

    if (selectedEmp && selectedEmp.empId !== emp.empId) {
       // Reset selection if switching employees
       setSelectedDates([day]);
       setSelectedEmp(emp);
       return;
    }

    setSelectedEmp(emp);

    if (event.shiftKey && selectedDates.length > 0) {
      // Range selection
      const lastDate = selectedDates[selectedDates.length - 1];
      const start = lastDate < day ? lastDate : day;
      const end = lastDate < day ? day : lastDate;
      
      const interval = eachDayOfInterval({ start, end });
      setSelectedDates(prev => {
        const otherEntries = prev.filter(d => !interval.some(i => isSameDay(i, d)));
        return [...otherEntries, ...interval];
      });
    } else {
      // Toggle selection
      setSelectedDates(prev => {
        const exists = prev.find(d => isSameDay(d, day));
        if (exists) return prev.filter(d => !isSameDay(d, day));
        return [...prev, day];
      });
    }
  };

  const groupDatesIntoRanges = (dates: Date[]) => {
    if (dates.length === 0) return [];
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const ranges: { start: string, end: string }[] = [];
    
    let currentStart = sortedDates[0];
    let currentEnd = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
        const prev = sortedDates[i-1];
        const current = sortedDates[i];
        const diff = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
            currentEnd = current;
        } else {
            ranges.push({
                start: format(currentStart, "yyyy-MM-dd"),
                end: format(currentEnd, "yyyy-MM-dd")
            });
            currentStart = current;
            currentEnd = current;
        }
    }
    ranges.push({
        start: format(currentStart, "yyyy-MM-dd"),
        end: format(currentEnd, "yyyy-MM-dd")
    });
    return ranges;
  };

  const handleBulkAddLeave = async () => {
    if (!selectedEmp || selectedDates.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const ranges = groupDatesIntoRanges(selectedDates);
      
      for (const range of ranges) {
        await rosterApi.addLeave(selectedEmp.empId, {
          ...range,
          type: leaveType as any
        });
      }
      
      toast.success(`Planned ${selectedDates.length} days for ${selectedEmp.name}`);
      setSelectedDates([]);
      setIsDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to apply bulk leave.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleClickManage = (day: Date, emp: Employee) => {
    if (!canEdit(emp)) return;
    setSelectedDates([day]);
    setSelectedEmp(emp);
    setIsDialogOpen(true);
  };

  const handleAddLeave = async () => {
    if (selectedDates.length > 1) {
      await handleBulkAddLeave();
      return;
    }

    const day = selectedDates[0];
    if (!day || !selectedEmp) return;
    
    setIsSubmitting(true);
    try {
      const leaveData = {
        start: format(day, "yyyy-MM-dd"),
        end: format(day, "yyyy-MM-dd"),
        type: leaveType as any
      };
      
      await rosterApi.addLeave(selectedEmp.empId, leaveData);
      toast.success(`Leave added for ${selectedEmp.name}`);
      setSelectedDates([]);
      setIsDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to add leave:", error);
      toast.error("Failed to add leave record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportRosterToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shift Roster');
    
    // Create headers: Personnel info + all days in month
    const headers = [
      { header: 'Employee', key: 'name', width: 25 },
      { header: 'Crew', key: 'crew', width: 10 },
      { header: 'Role', key: 'role', width: 20 },
      ...daysInMonth.map(day => ({
        header: format(day, "dd/MM"),
        key: day.toISOString(),
        width: 8
      }))
    ];
    worksheet.columns = headers;

    employees.forEach(emp => {
      const rowData: any = {
        name: emp.name,
        crew: emp.crew,
        role: emp.role
      };
      
      daysInMonth.forEach(day => {
        const shift = getShift(day, emp.crew);
        const leave = isDayOnLeave(day, emp.leaves);
        rowData[day.toISOString()] = leave ? (leave.type === "Applied on SAP" ? "S" : "P") : shift;
      });
      
      worksheet.addRow(rowData);
    });

    // Styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9E2F8' } // Light lilac
    };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `QIPP_Roster_${format(currentDate, "MMM_yyyy")}.xlsx`);
  };

  const getShift = (date: Date, crew: string) => {
    const diffInDays = Math.floor((date.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
    const cycle = SHIFT_CYCLES[crew] || SHIFT_CYCLES['General'];
    return cycle[((diffInDays % 8) + 8) % 8];
  };

  const isDayOnLeave = (date: Date, leaves: Leave[]) => {
    return leaves.find(l => {
      // The backend returns an ISO string like "2026-04-20T00:00:00.000Z", we just want the date part
      const dateStr = format(date, "yyyy-MM-dd");
      const startStr = l.start.toString().split('T')[0];
      const endStr = l.end.toString().split('T')[0];
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const detectConflict = (emp: Employee, day: Date) => {
    if (!isDayOnLeave(day, emp.leaves)) return false;
    return employees.some(other => 
      other.empId !== emp.empId && 
      other.crew === emp.crew && 
      other.role === emp.role && 
      isDayOnLeave(day, other.leaves)
    );
  };

  const handleDeleteLeave = async (leaveId: string) => {
    if (!selectedEmp) return;
    try {
      await rosterApi.deleteLeave(selectedEmp.empId, leaveId);
      toast.success("Leave entry removed");
      setIsDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Failed to delete leave");
    }
  };

  const hasConflictInSelection = useMemo(() => {
    if (selectedDates.length === 0 || !selectedEmp) return false;
    
    return selectedDates.some(day => 
      employees.some(other => 
        other.empId !== selectedEmp.empId && 
        other.crew === selectedEmp.crew && 
        other.role === selectedEmp.role && 
        isDayOnLeave(day, other.leaves)
      )
    );
  }, [selectedDates, selectedEmp, employees]);

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between p-6 bg-card border rounded-t-2xl">
        <div className="flex items-center gap-4">
          <CalendarIcon className="text-brand-lilac" />
          <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(monthStart, -1))}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(monthEnd, 1))}>
            <ChevronRight size={16} />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          {user && (
            <Button 
              onClick={exportRosterToExcel}
              className="bg-brand-purple hover:bg-brand-purple/90 text-white gap-2 font-bold px-6 rounded-xl"
            >
               <FileSpreadsheet size={16} />
               Export Roster
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 px-6 py-4 bg-muted/10 border-b">
         {[
           { label: "Day Shift (D)", color: "bg-amber-50 border-amber-200 text-amber-700" },
           { label: "Night Shift (N)", color: "bg-blue-50 border-blue-200 text-blue-700" },
           { label: "Applied on SAP (S)", color: "bg-brand-lilac text-white" },
           { label: "Planned Leave (P)", color: "bg-brand-lime text-brand-purple" },
           { label: "Off (O)", color: "bg-muted/50 text-muted-foreground" },
         ].map(item => (
           <div key={item.label} className="flex items-center gap-2 text-xs font-bold">
             <div className={cn("w-6 h-6 rounded flex items-center justify-center border", item.color)}>
               {item.label.split('(')[1][0]}
             </div>
             <span>{item.label.split('(')[0]}</span>
           </div>
         ))}
      </div>

      <div className="overflow-x-auto border-x border-b rounded-b-2xl bg-card">
        <div style={{ width: `${200 + (daysInMonth.length * 48)}px` }}>
          {/* Header */}
          <div className="flex border-b bg-muted/30 sticky top-0 z-30">
            <div className="w-[200px] p-4 font-bold border-r bg-muted/30 shrink-0 sticky left-0 z-40">Personnel</div>
            <div className="flex flex-1">
              {daysInMonth.map(day => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "w-[48px] p-2 text-center border-r last:border-r-0 flex flex-col items-center justify-center shrink-0",
                    (day.getDay() === 5 || day.getDay() === 6) && "bg-muted/50"
                  )}
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(day, "eeeee")}</span>
                  <span className="text-sm font-black">{format(day, "d")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
            {employees.map((emp, i) => (
              <div key={emp._id || emp.empId || i} className="flex border-b group animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 20}ms` }}>
                <div 
                  className={cn(
                    "w-[200px] p-3 border-r bg-muted/5 flex flex-col justify-center min-h-[64px] transition-colors shrink-0 sticky left-0 z-20",
                    canEdit(emp) ? "cursor-pointer hover:bg-muted/10" : "cursor-default"
                  )}
                  onClick={() => handleSingleClickManage(new Date(), emp)}
                >
                  <p className="font-bold text-sm truncate">{emp.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 h-4">{emp.crew}</Badge>
                    <span className="text-[10px] text-muted-foreground truncate">{emp.role}</span>
                  </div>
                </div>
                <div className="flex flex-1">
                  {daysInMonth.map(day => {
                    const shift = getShift(day, emp.crew);
                    const leave = isDayOnLeave(day, emp.leaves);
                    const isConflicted = detectConflict(emp, day);
                    
                    let bg = "hover:bg-muted/30";
                    let text = "text-muted-foreground/30";
                    let content: React.ReactNode = shift === 'O' ? "" : shift;

                    if (shift === 'D') { bg = "bg-amber-50 text-amber-700"; }
                    if (shift === 'N') { bg = "bg-blue-50 text-blue-700"; }
                    
                    if (leave) {
                      bg = leave.type === "Applied on SAP" ? "bg-brand-lilac text-white" : "bg-brand-lime text-brand-purple";
                      content = (
                        <div className="relative flex items-center justify-center w-full h-full">
                          {isConflicted && (
                            <div className="absolute inset-0 border-2 border-rose-500 animate-pulse pointer-events-none" />
                          )}
                          <span className="z-10">{leave.type === "Applied on SAP" ? "S" : "P"}</span>
                          {isConflicted && (
                            <AlertCircle className="absolute top-1 right-1 h-2.5 w-2.5 text-rose-500 fill-white" />
                          )}
                        </div>
                      );
                      text = "font-bold";
                    }

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={cn(
                          "w-[48px] min-h-[64px] border-r last:border-r-0 flex items-center justify-center text-xs transition-all active:scale-95 relative shrink-0",
                          canEdit(emp) ? "cursor-pointer" : "cursor-default",
                          bg,
                          text,
                          selectedEmp?.empId === emp.empId && selectedDates.some(d => isSameDay(d, day)) && "ring-2 ring-inset ring-brand-purple z-10 bg-brand-purple/10",
                          isConflicted && "ring-2 ring-inset ring-rose-500 animate-pulse bg-rose-500/10 z-10"
                        )}
                        onClick={(e) => handleCellClick(day, emp, e)}
                        onDoubleClick={() => handleSingleClickManage(day, emp)}
                        title={`${emp.name} | ${format(day, "dd/MM/yyyy")} | ${leave ? `${leave.type}${isConflicted ? ' (CONFLICT)' : ''}` : `Shift: ${shift}`}`}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend removed and moved to top */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <CalendarIcon className="text-brand-lilac" />
              Manage Leave
            </DialogTitle>
            <DialogDescription>
              Assign or update leave for {selectedEmp?.name} for the {selectedDates.length} selected days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Employee</Label>
              <div className="p-3 bg-muted/50 rounded-xl border border-border flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-brand-lime font-bold">
                    {selectedEmp?.name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                    <p className="font-bold">{selectedEmp?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmp?.role} ({selectedEmp?.crew})</p>
                 </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-card border rounded-xl">
                  <SelectItem value="Planned">Planned Leave (P)</SelectItem>
                  <SelectItem value="Applied on SAP">Applied on SAP (S)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hasConflictInSelection && (
              <Alert className="bg-rose-500/10 border-rose-500/20">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <p className="text-[10px] text-rose-500 leading-tight font-bold">
                  ⚠️ CONFLICT DETECTED: Another personnel in Crew {selectedEmp?.crew} ({selectedEmp?.role}) is already on leave during this period.
                </p>
              </Alert>
            )}

            {!hasConflictInSelection && (
              <Alert className="bg-brand-lilac/5 border-brand-lilac/20">
                <AlertCircle className="h-4 w-4 text-brand-lilac" />
                <p className="text-[10px] text-brand-lilac leading-tight">
                  This will update the operational roster. Leave conflicts will be automatically flagged for Crew {selectedEmp?.crew}.
                </p>
              </Alert>
            )}

            {/* List Existing Leaves */}
            {selectedEmp && selectedEmp.leaves.length > 0 && (
              <div className="space-y-2">
                <Label className="font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Existing Roster Entries</Label>
                <div className="space-y-1 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedEmp.leaves.map((l: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border border-border text-[10px] font-bold">
                      <span className="text-zinc-600">
                        {format(new Date(l.start), "dd MMM")} &rarr; {format(new Date(l.end), "dd MMM")}
                        <span className="ml-2 text-brand-lilac opacity-70">({l.type === 'Applied on SAP' ? 'S' : 'P'})</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-[9px] font-black"
                        onClick={() => handleDeleteLeave(l._id)}
                      >
                        REMOVE
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              className="bg-brand-lilac hover:bg-brand-lilac/90 text-white font-bold rounded-xl px-8"
              onClick={handleAddLeave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : "Update Roster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedDates.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-brand-purple border border-brand-lilac/20 shadow-2xl rounded-2xl flex items-center gap-6"
          >
            <div className="flex flex-col">
               <span className="text-brand-lime text-xs font-black uppercase tracking-widest leading-none">Roster Selection</span>
               <span className="text-white text-lg font-bold flex items-center gap-2">
                  {selectedDates.length} days selected
                  {hasConflictInSelection && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 text-[10px] font-bold animate-pulse">
                      <AlertCircle size={10} />
                      CREW CONFLICT
                    </div>
                  )}
                </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedDates([])}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                Clear
              </Button>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-brand-lime hover:bg-brand-lime/90 text-brand-purple font-black rounded-xl px-6"
              >
                Plan Selection
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
