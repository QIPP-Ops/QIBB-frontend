"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">Personnel Sign In</h1>
        <p className="text-zinc-500 font-medium">Verify credentials to access internal systems</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Personnel Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={20} />
            <Input 
              className="bg-white/5 border-white/10 h-14 pl-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-2xl" 
              placeholder="user@acwapower.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold ml-1 uppercase text-[10px] tracking-[0.2em]">Access Password</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-lilac transition-colors" size={20} />
            <Input 
              className="bg-white/5 border-white/10 h-14 pl-12 pr-12 text-white focus:bg-white/10 focus:border-brand-lilac focus:ring-brand-lilac/20 transition-all rounded-2xl" 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose-500 text-sm font-bold text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/20"
          >
            {error}
          </motion.p>
        )}

        <Button 
          className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black h-14 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.1em] text-sm shadow-lg shadow-brand-lilac/20" 
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Authenticate Profile"}
        </Button>
      </form>

      <div className="mt-12 pt-8 border-t border-white/5 text-center lg:text-left">
         <p className="text-zinc-500 text-sm font-medium">
           New to the portal? {" "}
           <a href="/register" className="text-brand-lime hover:text-brand-lime/80 hover:underline font-black transition-colors">Request Access</a>
         </p>
         <p className="mt-6 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] leading-relaxed">
            RESTRICTED ACCESS: This system is for authorized personnel only. All interactions are logged for security verification.
         </p>
      </div>
    </div>
  );
}
