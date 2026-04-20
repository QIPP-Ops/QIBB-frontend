"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Lock, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await register({ email, password, role: 'viewer' });
      toast.success("Account created successfully. You can now login.");
      // Optionally redirect after a delay
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-lilac/20 rounded-full blur-[120px] translate-y-1/2 translate-x-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/login" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group w-fit">
           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
           <span className="text-sm font-bold uppercase tracking-widest">Back to Login</span>
        </Link>

        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-brand-purple rounded-2xl flex items-center justify-center mb-4">
              <UserPlus size={40} className="text-brand-lime" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase">Access Registration</h1>
           <p className="text-zinc-500 font-medium text-center px-8">Request standard operations portal entry</p>
        </div>

        <Card className="p-8 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold ml-1">WORK EMAIL</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-600" size={18} />
                <Input 
                  className="bg-zinc-950/50 border-zinc-800 h-12 pl-10 text-white focus:border-brand-lilac focus:ring-1 focus:ring-brand-lilac transition-all" 
                  placeholder="name@acwa.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold ml-1">PASSWORD</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-600" size={18} />
                <Input 
                  className="bg-zinc-950/50 border-zinc-800 h-12 pl-10 text-white focus:border-brand-lilac focus:ring-1 focus:ring-brand-lilac transition-all" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold ml-1">CONFIRM PASSWORD</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-600" size={18} />
                <Input 
                  className="bg-zinc-950/50 border-zinc-800 h-12 pl-10 text-white focus:border-brand-lilac focus:ring-1 focus:ring-brand-lilac transition-all" 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full bg-brand-purple hover:bg-brand-purple/90 text-brand-lime font-black h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "COMPLETE REGISTRATION"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            Standard Personnel access verification.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
