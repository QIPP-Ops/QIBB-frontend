"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  CalendarRange, 
  FileText, 
  Users, 
  ShieldCheck, 
  Settings,
  ChevronLeft,
  GraduationCap,
  LogOut,
  UserCircle,
  Terminal
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const routes = [
    {
      label: "Leave Planner",
      icon: CalendarRange,
      href: "/calendar",
      color: "text-brand-lime",
    },
    {
      label: "Admin Control",
      icon: Terminal,
      href: "/admin-portal",
      color: "text-brand-lime",
      adminOnly: true,
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/reports",
      color: "text-sky-500",
    },
    {
      label: "Management",
      icon: Users,
      href: "/management",
      color: "text-orange-500",
      adminOnly: true,
    },
    {
      label: "PTW",
      icon: ShieldCheck,
      href: "/safety",
      color: "text-emerald-500",
    },
    {
      label: "Trainings Hub",
      icon: GraduationCap,
      href: "/trainings",
      color: "text-brand-lilac",
    },
  ];

  const filteredRoutes = routes.filter(route => !route.adminOnly || user?.role === 'admin');

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-brand-purple text-white transition-all duration-300 ease-in-out border-r border-brand-lilac/10",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="px-3 py-6 flex-1">
        <div className={cn("flex items-center mb-10 group", isCollapsed ? "flex-col justify-center gap-4 mt-2 px-0" : "justify-between px-3")}>
          <Link href="/calendar" className="flex items-center justify-center">
            <div className={cn("relative w-8 h-8 flex items-center justify-center bg-transparent shrink-0 group-hover:scale-110 transition-transform", !isCollapsed && "mr-4")}>
               <img src="/acwa-logo-white.svg" alt="ACWA" className="w-8 h-8" />
            </div>
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold tracking-tight text-white"
              >
                ACWA <span className="text-brand-lime">Ops</span>
              </motion.h1>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                isCollapsed && "justify-center px-2"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 shrink-0", route.color, isCollapsed && "mr-0")} />
                {!isCollapsed && <span>{route.label}</span>}
              </div>
              {!isCollapsed && pathname === route.href && (
                <div className="w-1 h-5 bg-brand-lime rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-white/5 space-y-2">
         {user && (
           <div className="space-y-1">
              {/* Settings Link - Only entry point for profile/logout */}
              <Link
                href="/settings"
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all",
                  pathname === "/settings" ? "text-white bg-white/10" : "text-zinc-400",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Settings className={cn("h-5 w-5 mr-3 shrink-0 text-brand-lilac", isCollapsed && "mr-0")} />
                {!isCollapsed && <span>Settings & Profile</span>}
              </Link>

              {!isCollapsed && (
                <div className="px-3 py-2 mt-4 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Personnel Session</p>
                   <p className="text-xs font-bold truncate text-brand-lime">{user?.email}</p>
                   <Badge className="mt-1 bg-brand-lilac/20 text-brand-lilac hover:bg-brand-lilac/30 border-none text-[8px] h-4 font-black px-2 tracking-widest uppercase">
                     {user.role || 'Personnel'}
                   </Badge>
                </div>
              )}
           </div>
         )}

         {!user && (
           <Link
             href="/login"
             className={cn(
               "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-brand-lilac/10 rounded-lg transition-all text-brand-lilac",
               isCollapsed && "justify-center px-2"
             )}
           >
             <ShieldCheck className={cn("h-5 w-5 mr-3 shrink-0", isCollapsed && "mr-0")} />
             {!isCollapsed && <span>Personnel Sign In</span>}
           </Link>
         )}
      </div>
    </div>
  );
}
