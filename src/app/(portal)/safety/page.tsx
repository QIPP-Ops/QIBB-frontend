"use client";

import { useEffect, useState } from "react";
import { safetyApi } from "@/lib/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  FileText,
  ShieldCheck,
  AlertTriangle,
  History,
  Plus,
  Info
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function SafetyHub() {
  const { user } = useAuth();
  const [permits, setPermits] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const fetchPermits = async () => {
    try {
      const response = await safetyApi.getPermits();
      setPermits(response.data);
    } catch (err) {
      toast.error("Failed to fetch permit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await safetyApi.updatePermit(id, { 
        status, 
        authorizedBy: user?.name || user?.email || "System Admin" 
      });
      toast.success(`Permit status updated: ${status}`);
      fetchPermits();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const filteredPermits = permits.filter(p => 
    p.permitId.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'Pending': return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case 'Closed': return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700";
      case 'Suspended': return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hot Work': return "text-orange-600 dark:text-orange-400";
      case 'Confined Space': return "text-purple-600 dark:text-purple-400";
      case 'Working at Height': return "text-yellow-600 dark:text-yellow-400";
      case 'Electrical Isolation': return "text-cyan-600 dark:text-cyan-400";
      case 'Cold Work': return "text-blue-600 dark:text-blue-400";
      default: return "text-zinc-600 dark:text-zinc-400";
    }
  };

  const stats = {
    active: permits.filter(p => p.status === 'Active').length,
    pending: permits.filter(p => p.status === 'Pending').length,
    highRisk: permits.filter(p => ['Confined Space', 'Working at Height', 'Hot Work'].includes(p.type) && p.status === 'Active').length
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lilac" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Formal Corporate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-purple dark:text-white tracking-tight">
            Safety & Permit-to-Work Registry
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Official repository for hazardous work authorizations and operational compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Filter by ID, Area or Scope..." 
              className="pl-9 w-72 bg-white dark:bg-card border-border h-10 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-lilac hover:bg-brand-lilac/90 text-white gap-2 font-semibold h-10 px-5 rounded-lg shadow-sm">
                <Plus className="h-4 w-4" />
                New Permit Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-card border-border rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-brand-lilac h-5 w-5" />
                  Work Permit Authorization Request
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newPermit = {
                  type: formData.get("type"),
                  location: formData.get("location"),
                  description: formData.get("description"),
                  contractor: formData.get("contractor") || "Internal Team",
                  validFrom: new Date(),
                  validTo: new Date(Date.now() + 8 * 60 * 60 * 1000), 
                  issuedBy: user?.name || "Guest User",
                  status: "Pending"
                };
                try {
                  await safetyApi.createPermit(newPermit);
                  toast.success("Request submitted successfully.");
                  setIsRequestOpen(false);
                  fetchPermits();
                } catch (err) {
                  toast.error("Submission failed");
                }
              }} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Permit Classification</Label>
                    <Select name="type" defaultValue="General">
                      <SelectTrigger className="h-10 rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Hot Work', 'Cold Work', 'Confined Space', 'Working at Height', 'Electrical Isolation', 'General'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Operational Area</Label>
                    <Input name="location" placeholder="e.g. Unit 1 Turbine Floor" required className="h-10 rounded-md" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Scope of Activities</Label>
                  <Input name="description" placeholder="Description of work and hazards" required className="h-10 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Performing Team / Contractor</Label>
                  <Input name="contractor" placeholder="Entity performing the work" className="h-10 rounded-md" />
                </div>
                <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90 h-11 font-bold rounded-lg mt-2 text-white">
                  Submit for Authorization
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Structured Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 border bg-white dark:bg-card flex flex-col items-center justify-center text-center gap-3 rounded-xl shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
             <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Permits</p>
            <p className="text-3xl font-bold text-brand-purple dark:text-white leading-none">{stats.active}</p>
          </div>
        </Card>

        <Card className="p-6 border bg-white dark:bg-card flex flex-col items-center justify-center text-center gap-3 rounded-xl shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
             <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Awaiting Review</p>
            <p className="text-3xl font-bold text-brand-purple dark:text-white leading-none">{stats.pending}</p>
          </div>
        </Card>

        <Card className="p-6 border bg-white dark:bg-card flex flex-col items-center justify-center text-center gap-3 rounded-xl shadow-sm">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg">
             <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">High Risk Work</p>
            <p className="text-3xl font-bold text-brand-purple dark:text-white leading-none">{stats.highRisk}</p>
          </div>
        </Card>
      </div>

      {/* Formal Registry Table */}
      <Card className="border shadow-sm rounded-xl bg-white dark:bg-card overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/5 flex items-center justify-between">
           <h2 className="text-sm font-bold text-brand-purple dark:text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-brand-lilac" />
              Operational Permit Registry
           </h2>
           <Badge variant="outline" className="text-[10px] px-3 font-semibold uppercase bg-muted/20">
              Live Data Feed
           </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-[140px] font-bold text-xs px-6">Permit ID</TableHead>
                <TableHead className="font-bold text-xs">Classification</TableHead>
                <TableHead className="font-bold text-xs text-center">Status</TableHead>
                <TableHead className="font-bold text-xs">Work Area</TableHead>
                <TableHead className="font-bold text-xs">Valid Until</TableHead>
                <TableHead className="text-right px-6 font-bold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermits.map((p) => {
                const isHighRisk = ['Confined Space', 'Working at Height', 'Hot Work'].includes(p.type);
                
                return (
                  <TableRow key={p.permitId} className={cn(
                    "hover:bg-muted/5 transition-colors border-border",
                    isHighRisk && p.status === 'Active' && "bg-rose-50/30 dark:bg-rose-900/5"
                  )}>
                    <TableCell className="font-mono text-xs text-muted-foreground px-6 py-4">{p.permitId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={cn("font-bold text-sm", getTypeColor(p.type))}>{p.type}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[280px]">{p.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "font-bold text-[10px] px-3 py-0.5 rounded-full border shadow-none",
                        getStatusBadge(p.status)
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{p.location}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(p.validTo), "HH:mm | dd MMM")}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        {user?.role === 'admin' && p.status === 'Pending' && (
                          <Button 
                            size="sm" 
                            className="h-8 rounded-md bg-brand-lilac hover:bg-brand-lilac/90 text-white font-semibold text-xs px-3"
                            onClick={() => handleUpdateStatus(p._id, 'Active')}
                          >
                            Authorize
                          </Button>
                        )}
                        {user?.role === 'admin' && p.status === 'Active' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-semibold text-xs px-3"
                            onClick={() => handleUpdateStatus(p._id, 'Closed')}
                          >
                            Revoke
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-brand-purple rounded-md">
                          <FileText size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredPermits.length === 0 && (
            <div className="p-16 text-center text-muted-foreground text-sm font-medium italic">
              No permit records found in the current view.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
