"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-lilac/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-purple/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-brand-lime rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={40} className="text-brand-purple" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">ACWA OPERATIONS</h1>
           <p className="text-zinc-500 font-medium">QIPP Unified Control Portal</p>
        </div>

        <Card className="p-8 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold ml-1">PERSONNEL EMAIL</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-600" size={18} />
                <Input 
                  className="bg-zinc-950/50 border-zinc-800 h-12 pl-10 text-white focus:border-brand-lilac focus:ring-1 focus:ring-brand-lilac transition-all" 
                  placeholder="personnel@acwa.com"
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

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-rose-500 text-sm font-bold text-center"
              >
                {error}
              </motion.p>
            )}

            <Button 
              className="w-full bg-brand-lime hover:bg-brand-lime/90 text-brand-purple font-black h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "AUTHENTICATE SYSTEM"}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-xs text-zinc-600 font-medium">
              Authorized Personnel Only. System Access is Monitored.
            </p>
            <div className="pt-4 border-t border-zinc-800">
               <p className="text-zinc-500 text-sm">
                 New to the system? {" "}
                 <a href="/register" className="text-brand-lime hover:underline font-bold">Register as Viewer</a>
               </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
