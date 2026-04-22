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
  Plus
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
      toast.error("Failed to connect to safety matrix");
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
        authorizedBy: user?.email || "Unknown Admin" 
      });
      toast.success(`Permit status updated to ${status}`);
      fetchPermits();
    } catch (err) {
      toast.error("Authorization failed");
    }
  };

  const filteredPermits = permits.filter(p => 
    p.permitId.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="text-brand-lime h-7 w-7" />
            Safety & Permit Hub
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Hazardous Work Tracking & Compliance
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            Verified Environment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Query permits..." 
              className="pl-9 w-64 bg-card border-border h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-lilac hover:bg-brand-lilac/90 text-white gap-2 font-bold h-10 px-6 rounded-xl">
                <Plus className="h-4 w-4" />
                New PTW Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-card border-border rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="text-brand-lilac" />
                  Request Work Permit
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newPermit = {
                  type: formData.get("type"),
                  location: formData.get("location"),
                  description: formData.get("description"),
                  contractor: formData.get("contractor") || "Internal Personnel",
                  validFrom: new Date(),
                  validTo: new Date(Date.now() + 8 * 60 * 60 * 1000), // Default 8 hours
                  issuedBy: user?.email || "Personnel Guest",
                  status: "Pending"
                };
                try {
                  await safetyApi.createPermit(newPermit);
                  toast.success("Permit request logged. Awaiting authorization.");
                  setIsRequestOpen(false);
                  fetchPermits();
                } catch (err) {
                  toast.error("Failed to submit request");
                }
              }} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Permit Type</Label>
                    <Select name="type" defaultValue="General">
                      <SelectTrigger>
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
                    <Label>Location</Label>
                    <Input name="location" placeholder="e.g. Pump Station 1" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Detailed Scope of Work</Label>
                  <Input name="description" placeholder="Specify nature of hazardous activities" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Contractor / Assigned Personnel</Label>
                  <Input name="contractor" placeholder="Internal or Third-party name" />
                </div>
                <Button type="submit" className="w-full bg-brand-lilac hover:bg-brand-lilac/90 h-12 font-bold rounded-xl mt-2 text-white">Log Permit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Safety Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 border flex items-center justify-between group overflow-hidden relative">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Permits</p>
            <p className="text-3xl font-black text-white">{stats.active}</p>
          </div>
          <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime">
             <ShieldCheck size={28} />
          </div>
        </Card>
        <Card className="p-6 border flex items-center justify-between group overflow-hidden relative">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Sync</p>
            <p className="text-3xl font-black text-white">{stats.pending}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
             <History size={28} />
          </div>
        </Card>
        <Card className="p-6 border flex items-center justify-between group overflow-hidden relative">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">High Risk Activity</p>
            <p className="text-3xl font-black text-white">{stats.highRisk}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
             <AlertTriangle size={28} />
          </div>
        </Card>
      </div>

      {/* Permit Registry */}
      <Card className="border overflow-hidden rounded-[2rem] bg-card/30 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none">
              <TableHead className="font-bold text-xs uppercase tracking-widest px-6 h-14">Permit UID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest h-14">Class</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest h-14">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest h-14">Work Area</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest h-14">Validity</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-right px-6 h-14">Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermits.map((p) => (
              <TableRow key={p.permitId} className="group hover:bg-muted/10 transition-all border-border">
                <TableCell className="font-mono text-zinc-500 px-6 py-5">{p.permitId}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{p.type}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{p.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "font-bold text-[10px] border-none shadow-sm",
                    p.status === 'Active' && "bg-brand-lime/10 text-brand-lime",
                    p.status === 'Pending' && "bg-amber-500/10 text-amber-500",
                    p.status === 'Closed' && "bg-zinc-800 text-zinc-500",
                    p.status === 'Suspended' && "bg-rose-500/10 text-rose-500",
                  )}>
                    {p.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400 font-medium">{p.location}</TableCell>
                <TableCell className="text-[10px] font-bold text-zinc-500 uppercase">
                  {format(new Date(p.validTo), "HH:mm")} | {format(new Date(p.validTo), "dd MMM")}
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    {user?.role === 'admin' && p.status === 'Pending' && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 rounded-lg bg-brand-lilac hover:bg-brand-lilac/80"
                        onClick={() => handleUpdateStatus(p._id, 'Active')}
                      >
                        Authorize
                      </Button>
                    )}
                    {user?.role === 'admin' && p.status === 'Active' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleUpdateStatus(p._id, 'Closed')}
                      >
                        Revoke/Close
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-600 hover:text-white">
                      <FileText size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredPermits.length === 0 && (
          <div className="p-20 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-30">
            Registry Entries: Null
          </div>
        )}
      </Card>
    </div>
  );
}
