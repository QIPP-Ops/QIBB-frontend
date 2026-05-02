"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Lock, Mail, ArrowLeft, UserCircle, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    empId: "",
    crew: "",
    role: ""
  });

  const [crews, setCrews] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await adminApi.getConfig();
        if (response.data) {
          setCrews(response.data.availableCrews || []);
          setRoles(response.data.availableRoles || []);
          // Set defaults once loaded
          setFormData(prev => ({
            ...prev,
            crew: response.data.availableCrews[0] || "",
            role: response.data.availableRoles[0] || ""
          }));
        }
      } catch (err: any) {
        console.error("Failed to load operational config:", err.response?.data || err.message);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        empId: formData.empId,
        crew: formData.crew,
        role: formData.role,
        accessRole: 'viewer' // Default access role
      });
      toast.success("Registration successful. Access is pending admin approval.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link href="/login" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group w-fit">
         <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Sign In</span>
      </Link>

      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">Personnel Registration</h1>
        <p className="text-zinc-500 font-medium text-sm">Create your official operational profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Full Name</Label>
          <div className="relative group">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={18} />
            <Input 
              className="bg-white/5 border-white/10 h-12 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-xl text-sm" 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {/* Employee ID */}
           <div className="space-y-1.5">
             <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Personnel ID</Label>
             <div className="relative group">
               <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={18} />
               <Input 
                 className="bg-white/5 border-white/10 h-12 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-xl text-sm" 
                 placeholder="500..."
                 value={formData.empId}
                 onChange={(e) => setFormData({...formData, empId: e.target.value})}
                 required
               />
             </div>
           </div>

           {/* Crew Selection */}
           <div className="space-y-1.5">
             <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Crew</Label>
             <Select value={formData.crew} onValueChange={(val) => setFormData({...formData, crew: val})}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-brand-lilac/20 rounded-xl text-sm">
                   <SelectValue placeholder="Select Crew" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                   {crews.map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                </SelectContent>
             </Select>
           </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Designation / Role</Label>
          <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
             <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-brand-lilac/20 rounded-xl text-sm">
                <div className="flex items-center gap-3">
                   <Users className="text-zinc-600" size={18} />
                   <SelectValue placeholder="Select Role" />
                </div>
             </SelectTrigger>
             <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
             </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Work Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={18} />
            <Input 
              className="bg-white/5 border-white/10 h-12 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-xl text-sm" 
              placeholder="name@acwapower.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1.5">
             <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Password</Label>
             <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={18} />
               <Input 
                 className="bg-white/5 border-white/10 h-12 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-xl text-sm" 
                 type="password"
                 placeholder="••••"
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
                 required
               />
             </div>
           </div>
           <div className="space-y-1.5">
             <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Confirm</Label>
             <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={18} />
               <Input 
                 className="bg-white/5 border-white/10 h-12 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-xl text-sm" 
                 type="password"
                 placeholder="••••"
                 value={formData.confirmPassword}
                 onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                 required
               />
             </div>
           </div>
        </div>

        <Button 
          className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.1em] text-xs shadow-lg shadow-brand-lilac/20 mt-4" 
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Register Personnel Profile"}
        </Button>
      </form>

      <p className="mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-[0.15em] leading-relaxed text-center lg:text-left">
        By registering, you agree to ACWA Power's operational security protocols. Access is strictly audited.
      </p>
    </div>
  );
}
