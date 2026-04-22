"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { adminApi, rosterApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  UserPlus, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Loader2,
  Terminal,
  Server
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AdminPortal() {
  const { user, register } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newCrew, setNewCrew] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Action States
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  const [isAddingPersonnel, setIsAddOpen] = useState(false);

  const [adminFormData, setAdminFormData] = useState({
    name: "", empId: "", email: "", password: "", crew: "S", role: "Management"
  });

  const [personnelFormData, setPersonnelFormData] = useState({
    name: "", empId: "", crew: "A", role: "Local Operator"
  });

  const fetchConfig = async () => {
    try {
      const response = await adminApi.getConfig();
      setConfig(response.data);
    } catch (err) {
      toast.error("Failed to fetch system configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchConfig();
    }
  }, [user]);

  const handleAddCrew = async () => {
    if (!newCrew) return;
    try {
      await adminApi.addCrew(newCrew);
      toast.success(`Crew ${newCrew} added.`);
      setNewCrew("");
      fetchConfig();
    } catch (err) {
      toast.error("Failed to add crew.");
    }
  };

  const handleRemoveCrew = async (crew: string) => {
    try {
      await adminApi.removeCrew(crew);
      toast.success(`Crew ${crew} removed.`);
      fetchConfig();
    } catch (err) {
      toast.error("Failed to remove crew.");
    }
  };

  const handleAddRole = async () => {
    if (!newRole) return;
    try {
      await adminApi.addRole(newRole);
      toast.success(`Role ${newRole} added.`);
      setNewRole("");
      fetchConfig();
    } catch (err) {
      toast.error("Failed to add role.");
    }
  };

  const handleRemoveRole = async (role: string) => {
    try {
      await adminApi.removeRole(role);
      toast.success(`Role removed.`);
      fetchConfig();
    } catch (err) {
      toast.error("Failed to remove role.");
    }
  };

  const handleToggleLock = async () => {
    try {
      const newLockState = !config.editingLocked;
      await adminApi.setLock(newLockState);
      toast.success(`System ${newLockState ? 'Locked' : 'Unlocked'}`);
      fetchConfig();
    } catch (err) {
      toast.error("Failed to toggle system lock.");
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ ...adminFormData, accessRole: 'admin' });
      toast.success("New Administrator registered.");
      setIsRegisteringAdmin(false);
      setAdminFormData({ name: "", empId: "", email: "", password: "", crew: "S", role: "Management" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rosterApi.createEmployee({ ...personnelFormData, leaves: [] });
      toast.success("Personnel added to roster.");
      setIsAddOpen(false);
      setPersonnelFormData({ name: "", empId: "", crew: "A", role: "Local Operator" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add personnel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="p-12 text-center max-w-md border-rose-100 bg-rose-50/30 rounded-[2rem]">
          <ShieldAlert size={64} className="text-rose-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-rose-900 uppercase tracking-tight">Access Restricted</h1>
          <p className="text-rose-700 mt-2 font-medium">This command center is reserved for high-level system administrators only.</p>
        </Card>
      </div>
    );
  }

  if (loading || !config) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-brand-lilac" size={48} />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-brand-purple p-8 rounded-[2.5rem] border border-brand-lilac/20 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-image.jpeg')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-brand-lime rounded-xl text-brand-purple">
                <Terminal size={24} />
             </div>
             <Badge className="bg-brand-lilac/30 text-brand-lilac hover:bg-brand-lilac/40 border-none font-black tracking-widest text-[10px]">ROOT ACCESS ACTIVE</Badge>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Admin Command Center</h1>
          <p className="text-zinc-300 mt-1 font-medium">Global system configuration and operational governance</p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
           <Button 
             onClick={handleToggleLock}
             className={cn(
               "rounded-xl font-bold gap-2 px-6 border-none",
               config.editingLocked ? "bg-brand-lime text-brand-purple hover:bg-brand-lime/90" : "bg-white/10 text-white hover:bg-white/20"
             )}
           >
             {config.editingLocked ? <Unlock size={18} /> : <Lock size={18} />}
             {config.editingLocked ? "Enable Global Editing" : "Lock System Roster"}
           </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-6 bg-white rounded-[2rem] border-brand-lilac/10 shadow-xl shadow-brand-lilac/5">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                 <Plus size={16} />
                 Quick Actions
              </h2>
              
              <div className="space-y-3">
                 {/* Register New Admin */}
                 <Dialog open={isRegisteringAdmin} onOpenChange={setIsRegisteringAdmin}>
                    <DialogTrigger asChild>
                       <Button className="w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl justify-between px-4 group text-xs">
                          <div className="flex items-center gap-2">
                             <ShieldAlert className="text-brand-lime" size={16} />
                             <span className="font-bold">Register Admin</span>
                          </div>
                          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
                       <DialogHeader>
                          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">New Administrator</DialogTitle>
                       </DialogHeader>
                       <form onSubmit={handleRegisterAdmin} className="space-y-4 pt-4">
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                             <Input 
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={adminFormData.name}
                               onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                               required 
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personnel ID</Label>
                                <Input 
                                  className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                                  value={adminFormData.empId}
                                  onChange={(e) => setAdminFormData({...adminFormData, empId: e.target.value})}
                                  required 
                                />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Default Crew</Label>
                                <Select value={adminFormData.crew} onValueChange={(v) => setAdminFormData({...adminFormData, crew: v})}>
                                   <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                      {config.availableCrews.map((c: string) => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Role/Title</Label>
                             <Input 
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={adminFormData.role}
                               onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value})}
                               required 
                             />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Email</Label>
                             <Input 
                               type="email"
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={adminFormData.email}
                               onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                               required 
                             />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Temporary Password</Label>
                             <Input 
                               type="password"
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={adminFormData.password}
                               onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                               required 
                             />
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black h-12 rounded-xl mt-4 uppercase tracking-widest border-none">
                             {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm ROOT Access"}
                          </Button>
                       </form>
                    </DialogContent>
                 </Dialog>

                 {/* Add Personnel */}
                 <Dialog open={isAddingPersonnel} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                       <Button className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl justify-between px-4 group border border-zinc-200 text-xs">
                          <div className="flex items-center gap-2">
                             <UserPlus className="text-brand-purple" size={16} />
                             <span className="font-bold">Add Personnel</span>
                          </div>
                          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
                       <DialogHeader>
                          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">Personnel Entry</DialogTitle>
                       </DialogHeader>
                       <form onSubmit={handleAddPersonnel} className="space-y-4 pt-4">
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personnel Name</Label>
                             <Input 
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={personnelFormData.name}
                               onChange={(e) => setPersonnelFormData({...personnelFormData, name: e.target.value})}
                               required 
                             />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personnel ID</Label>
                             <Input 
                               className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                               value={personnelFormData.empId}
                               onChange={(e) => setPersonnelFormData({...personnelFormData, empId: e.target.value})}
                               required 
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crew</Label>
                                <Select value={personnelFormData.crew} onValueChange={(v) => setPersonnelFormData({...personnelFormData, crew: v})}>
                                   <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                      {config.availableCrews.map((c: string) => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</Label>
                                <Select value={personnelFormData.role} onValueChange={(v) => setPersonnelFormData({...personnelFormData, role: v})}>
                                   <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                      {config.availableRoles.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-black h-12 rounded-xl mt-4 uppercase tracking-widest border-none">
                             {isSubmitting ? <Loader2 className="animate-spin" /> : "Save to Database"}
                          </Button>
                       </form>
                    </DialogContent>
                 </Dialog>
              </div>
           </Card>
        </div>

        {/* Configuration Columns */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crews Management */}
              <Card className="p-6 bg-white rounded-[2rem] border-brand-lilac/10 shadow-lg flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Active Crews</h3>
                    <div className="flex gap-2">
                       <Input 
                         placeholder="New Crew..." 
                         value={newCrew}
                         onChange={(e) => setNewCrew(e.target.value.toUpperCase())}
                         className="rounded-lg h-8 text-xs w-24"
                       />
                       <Button onClick={handleAddCrew} size="sm" className="bg-brand-lilac hover:bg-brand-lilac/90 text-white rounded-lg h-8 px-2 border-none">
                          <Plus size={16} />
                       </Button>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    {config.availableCrews.map((crew: string) => (
                       <Badge key={crew} variant="secondary" className="px-3 py-1.5 bg-slate-50 text-brand-purple border border-slate-100 rounded-lg font-bold group flex gap-2 items-center hover:bg-slate-100">
                          <span>Crew {crew}</span>
                          <button onClick={() => handleRemoveCrew(crew)} className="text-rose-400 hover:text-rose-600">
                             <Trash2 size={12} />
                          </button>
                       </Badge>
                    ))}
                 </div>
              </Card>

              {/* Roles Management */}
              <Card className="p-6 bg-white rounded-[2rem] border-brand-lilac/10 shadow-lg flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">System Roles</h3>
                    <div className="flex gap-2">
                       <Input 
                         placeholder="New Role..." 
                         value={newRole}
                         onChange={(e) => setNewRole(e.target.value)}
                         className="rounded-lg h-8 text-xs w-32"
                       />
                       <Button onClick={handleAddRole} size="sm" className="bg-brand-lilac hover:bg-brand-lilac/90 text-white rounded-lg h-8 px-2 border-none">
                          <Plus size={16} />
                       </Button>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                    {config.availableRoles.map((role: string) => (
                       <Badge key={role} variant="secondary" className="px-3 py-1.5 bg-slate-50 text-zinc-600 border border-slate-100 rounded-lg text-[10px] font-bold group flex gap-2 items-center hover:bg-slate-100">
                          <span>{role}</span>
                          <button onClick={() => handleRemoveRole(role)} className="text-rose-400 hover:text-rose-600">
                             <Trash2 size={10} />
                          </button>
                       </Badge>
                    ))}
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
