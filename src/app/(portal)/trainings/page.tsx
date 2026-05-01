"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  ExternalLink, 
  Award, 
  Search,
  BookOpen,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MISHKATY_PURPLE = "hsl(261, 65%, 66%)";

const COURSES = [
  {
    id: 1,
    title: "Environment, Health & Safety (EHS) - Level 1",
    provider: "Mishkaty",
    duration: "4h 30m",
    status: "Completed",
    category: "Safety",
    icon: GraduationCap
  },
  {
    id: 2,
    title: "Cyber Security Awareness 2026",
    provider: "Mishkaty",
    duration: "1h 15m",
    status: "In Progress",
    category: "Compliance",
    progress: 65,
  },
  {
    id: 3,
    title: "Plant Operations: Steam Turbine Basics",
    provider: "Technical Academy",
    duration: "12h 00m",
    status: "Available",
    category: "Technical",
  },
  {
    id: 4,
    title: "Fire Safety & Emergency Response",
    provider: "Mishkaty",
    duration: "2h 45m",
    status: "Completed",
    category: "Safety",
  }
];

export default function TrainingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-['Montserrat',sans-serif]">
      {/* Legacy Mishkaty Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <span 
              className="p-3 rounded-2xl flex items-center justify-center text-white" 
              style={{ backgroundColor: MISHKATY_PURPLE }}
            >
              <GraduationCap size={28} />
            </span>
            Training Hub
          </h1>
          <p className="text-muted-foreground mt-2 text-sm flex items-center gap-2">
            Mishkaty Learning Management System
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            ACWA Power Corporate Academy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search curriculum..." 
              className="pl-9 w-64 bg-card border-border h-10 rounded-xl"
            />
          </div>
          <a 
            href="https://mishkaty.sabacloud.com/Saba/Web_spf/EU2PRD0191/app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              className="text-white font-bold h-10 px-6 rounded-xl gap-2 shadow-lg hover:brightness-110"
              style={{ backgroundColor: MISHKATY_PURPLE }}
            >
              <ExternalLink size={16} />
              Mishkaty Login
            </Button>
          </a>
        </div>
      </div>

      {/* Legacy Original Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-none bg-transparent">
          <Tabs defaultValue="my-courses" className="space-y-6">
            <TabsList className="bg-card/50 p-1 border rounded-xl">
              <TabsTrigger value="my-courses" className="rounded-lg font-bold px-6">My Curriculum</TabsTrigger>
              <TabsTrigger value="catalog" className="rounded-lg font-bold px-6">Browse Catalog</TabsTrigger>
              <TabsTrigger value="certs" className="rounded-lg font-bold px-6">Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="my-courses" className="space-y-4">
              {COURSES.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-brand-lilac hover:shadow-xl hover:shadow-brand-lilac/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center opacity-80" 
                      style={{ backgroundColor: `${MISHKATY_PURPLE}20`, color: MISHKATY_PURPLE }}
                    >
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base group-hover:text-brand-lilac transition-colors">{course.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        <span>{course.provider}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                    <Badge 
                      className={cn(
                        "rounded-lg px-3 py-1 font-bold text-[10px] uppercase",
                        course.status === 'Completed' ? "bg-brand-lime/20 text-brand-lime" : "bg-brand-lilac/20 text-brand-lilac"
                      )}
                    >
                      {course.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      className="rounded-xl font-bold text-xs h-9"
                      style={{ borderColor: MISHKATY_PURPLE, color: MISHKATY_PURPLE }}
                    >
                      {course.status === 'Completed' ? "VIEW CERTS" : "RESUME"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Sidebar Mini-Stats (Engica/Original Style) */}
        <div className="space-y-6">
          <Card className="p-6 bg-brand-purple text-white border-none rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-brand-lime mb-2">
                <Award size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Status</span>
              </div>
              <h3 className="text-3xl font-black mb-1">94%</h3>
              <p className="text-sm opacity-70">Mandatory training progress across current personnel cycle.</p>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-10">
               <GraduationCap size={140} />
            </div>
          </Card>

          <Card className="p-6 border rounded-[2rem] space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="text-brand-lime" size={16} />
              Recent Achievements
            </h4>
            <div className="space-y-4">
              {[
                { name: "John Doe", course: "Lockout Tagout (LOTO)", date: "2h ago" },
                { name: "Sarah Smith", course: "Hazardous Materials", date: "5h ago" },
                { name: "Alex Wong", course: "Leadership Essentials", date: "yesterday" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px]">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">Certified in <b>{item.course}</b></p>
                    <p className="text-[9px] opacity-50 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
