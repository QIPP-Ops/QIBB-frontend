"use client";

import { useEffect, useState } from "react";
import { rosterApi } from "@/lib/api";
import RosterCalendar from "@/components/calendar/roster-grid";
import RosterCardView from "@/components/calendar/roster-card-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, LayoutGrid, List, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalendarPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");
  const [search, setSearch] = useState("");
  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await rosterApi.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roles = Array.from(new Set(employees.map(e => e.role)));

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());
    const matchesCrew = crewFilter === "all" || emp.crew === crewFilter;
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesSearch && matchesCrew && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-10 w-10 text-brand-lilac animate-spin" />
        <p className="text-muted-foreground animate-pulse">Synchronizing Roster...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4 max-w-[1600px] mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Shift Calendar & Leave Planner</h1>
          
          <div className="flex bg-white w-full md:w-auto rounded-lg border border-gray-200 p-1 shadow-sm">
            <button 
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-brand-lilac/10 text-brand-lilac shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} />
              Timeline Grid
            </button>
            <button 
              onClick={() => setViewMode("cards")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'cards' ? 'bg-brand-lilac/10 text-brand-lilac shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
               <List size={16} />
               Card View
            </button>
          </div>
        </div>
        
        <Alert className="bg-brand-lilac/5 border-brand-lilac/20 text-brand-lilac">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-bold">Operational Context</AlertTitle>
          <AlertDescription className="text-sm">
            This roster represents a standard 4-crew rotation (A, B, C, D) based on a 20-day cycle. 
            Modifications to leaves are tracked against the SAP production environment.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex gap-2">
            <Select value={crewFilter} onValueChange={setCrewFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Crews" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crews</SelectItem>
                {['A', 'B', 'C', 'D', 'S'].map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search personnel..." 
              className="pl-9 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {viewMode === "grid" ? (
          <RosterCalendar employees={filteredEmployees} onUpdate={fetchData} />
        ) : (
          <RosterCardView employees={filteredEmployees} />
        )}
      </motion.div>
    </div>
  );
}
