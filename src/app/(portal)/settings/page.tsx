"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Shield, 
  Mail, 
  Calendar, 
  Key, 
  CheckCircle2, 
  LogOut, 
  Settings as SettingsIcon,
  ShieldAlert,
  UserPlus,
  Lock,
  Briefcase,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout, register } = useAuth();
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    empId: "",
    email: "",
    password: "",
    crew: "S",
    role: "Management"
  });

  if (!user) return null;

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        ...adminFormData,
        accessRole: 'admin'
      });
      toast.success("New Administrator account created successfully.");
      setIsRegisteringAdmin(false);
      setAdminFormData({ name: "", empId: "", email: "", password: "", crew: "S", role: "Management" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create admin account.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <SettingsIcon size={32} className="text-brand-lilac" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Personnel profile, security preferences, and session management</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Dialog open={isRegisteringAdmin} onOpenChange={setIsRegisteringAdmin}>
              <DialogTrigger asChild>
                <Button className="bg-brand-lime hover:bg-brand-lime/90 text-brand-purple font-black rounded-xl px-6 gap-2">
                  <UserPlus size={18} />
                  Register New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create Admin Profile</DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Grant administrative privileges to a new personnel account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegisterAdmin} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                    <Input 
                      className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                      placeholder="Admin Name"
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
                        placeholder="ADMIN-..."
                        value={adminFormData.empId}
                        onChange={(e) => setAdminFormData({...adminFormData, empId: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crew</Label>
                      <Select value={adminFormData.crew} onValueChange={(v) => setAdminFormData({...adminFormData, crew: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {['A', 'B', 'C', 'D', 'General', 'S'].map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Role/Title</Label>
                    <Input 
                      className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                      placeholder="e.g. Plant Manager"
                      value={adminFormData.role}
                      onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Admin Email</Label>
                    <Input 
                      type="email"
                      className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                      placeholder="admin@acwapower.com"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure Password</Label>
                    <Input 
                      type="password"
                      className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                      placeholder="••••••••"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black h-12 rounded-xl mt-4 uppercase tracking-widest">
                    Confirm Admin Creation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Button 
            onClick={logout}
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl px-6 gap-2 font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="p-8 flex flex-col items-center text-center bg-white rounded-3xl border-brand-lilac/10 shadow-xl shadow-brand-lilac/5">
            <div className="w-24 h-24 bg-brand-lilac/10 rounded-[2rem] flex items-center justify-center text-brand-lilac mb-6 relative">
               <User size={48} strokeWidth={1.5} />
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-lime rounded-full border-4 border-white flex items-center justify-center text-brand-purple">
                  <CheckCircle2 size={16} strokeWidth={3} />
               </div>
            </div>
            <h2 className="text-xl font-bold truncate w-full">{user.email.split('@')[0]}</h2>
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-bold">Personnel</p>
            <Badge className="bg-brand-lime text-brand-purple hover:bg-brand-lime border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest">
              {user.role?.toUpperCase() || 'STANDARD'} ACCESS
            </Badge>
          </Card>
        </motion.div>

        {/* Right Column: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="p-8 bg-white rounded-3xl border-brand-lilac/10 shadow-xl shadow-brand-lilac/5">
             <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                <Mail size={20} className="text-brand-lilac" />
                Account Details
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Primary Email</p>
                   <p className="font-bold text-lg">{user.email}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Access Role</p>
                   <p className="font-bold text-lg capitalize">{user.role || 'Standard Personnel'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personnel ID</p>
                   <p className="font-bold text-lg font-mono">ACWA-{user.email.split('@')[0].toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Auth Protocol</p>
                   <p className="font-bold text-lg italic text-brand-lilac">ACWA Unified SSO</p>
                </div>
             </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
