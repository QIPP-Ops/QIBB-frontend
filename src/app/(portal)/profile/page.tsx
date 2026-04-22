"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Mail, Calendar, Key, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personnel account and security settings</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 space-y-6"
        >
          <Card className="p-8 flex flex-col items-center text-center bg-white rounded-3xl border-brand-lilac/10 shadow-xl shadow-brand-lilac/5">
            <div className="w-24 h-24 bg-brand-lilac/10 rounded-[2rem] flex items-center justify-center text-brand-lilac mb-6 relative">
               <User size={48} strokeWidth={1.5} />
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-lime rounded-full border-4 border-white flex items-center justify-center text-brand-purple">
                  <CheckCircle2 size={16} strokeWidth={3} />
               </div>
            </div>
            <h2 className="text-xl font-bold">{user.email.split('@')[0]}</h2>
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-bold">Personnel</p>
            <Badge className="bg-brand-lime text-brand-purple hover:bg-brand-lime border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest">
              {user.role?.toUpperCase() || 'STANDARD'} ACCESS
            </Badge>
          </Card>

          <Card className="p-6 bg-brand-purple text-white rounded-3xl border-none shadow-xl shadow-brand-purple/20">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-lime mb-4">System Status</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Shield size={18} className="text-brand-lime" />
                   <div className="text-sm">
                      <p className="font-bold">Encrypted</p>
                      <p className="text-[10px] text-zinc-400">End-to-end security active</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <Key size={18} className="text-brand-lime" />
                   <div className="text-sm">
                      <p className="font-bold">Verified</p>
                      <p className="text-[10px] text-zinc-400">Session expires in 24h</p>
                   </div>
                </div>
             </div>
          </Card>
        </motion.div>

        {/* Right Column: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 space-y-6"
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
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Login Method</p>
                   <p className="font-bold text-lg italic">ACWA Unified SSO</p>
                </div>
             </div>
          </Card>

          <Card className="p-8 bg-white rounded-3xl border-brand-lilac/10 shadow-xl shadow-brand-lilac/5">
             <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                <Calendar size={20} className="text-brand-lilac" />
                Operational Context
             </h3>
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Assignment</p>
                   <p className="font-bold text-brand-purple">QIPP Operational Unit</p>
                </div>
                <Badge variant="outline" className="border-brand-lilac/30 text-brand-lilac">ACTIVE</Badge>
             </div>
             <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
                Your profile information is automatically synchronized with the ACWA Power Personnel Directory. 
                For changes to your official records, please contact HR via SuccessFactors.
             </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
