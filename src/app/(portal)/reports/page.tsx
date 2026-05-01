"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FileText, 
  ShieldAlert, 
  Wind, 
  Activity, 
  Download,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const reportCategories = [
  {
    title: "Environmental Compliance",
    description: "Daily emission stack parameters and regulatory reporting.",
    icon: Wind,
    status: "Compliant",
    color: "text-brand-lime",
    bg: "bg-brand-lime/10",
  },
  {
    title: "Operations Monthly",
    description: "Consolidated KPI performance, heat rate analysis, and water production.",
    icon: Activity,
    status: "Updated",
    color: "text-brand-lilac",
    bg: "bg-brand-lilac/10",
  },
  {
    title: "PTW",
    description: "Permit to Work status, LOTO device counts, and HSE incidents.",
    icon: ShieldAlert,
    status: "Critical",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Mishkaty Trainings",
    description: "Crew training progress and technical certification tracker.",
    icon: Layers,
    status: "In Progress",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-bold">Reporting Hub</h1>
        <p className="text-muted-foreground mt-1 text-lg">Central portal for QIPP operational and regulatory data.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportCategories.map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 bg-card border hover:border-brand-lilac/50 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className={cn("p-4 rounded-2xl", report.bg)}>
                   <report.icon size={32} className={report.color} />
                </div>
                <Badge variant="outline" className={cn("font-bold px-3 py-1", report.color)}>
                  {report.status}
                </Badge>
              </div>

              <div className="mt-8 relative z-10">
                <h2 className="text-2xl font-bold mb-3">{report.title}</h2>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{report.description}"
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4 relative z-10">
                <Link href={
                  report.title === "Environmental Compliance" 
                    ? "/reports/environmental" 
                    : report.title === "Operations Monthly"
                    ? "/reports/operations"
                    : "/reports"
                }>
                  <Button className="bg-brand-purple hover:bg-brand-purple/90 text-white gap-2 px-6">
                    View Data
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Button variant="ghost" className="gap-2">
                    <Download size={16} />
                    Export PDF
                  </Button>
                )}
              </div>

              {/* Background Accent */}
              <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <report.icon size={120} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-8 bg-brand-purple rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="relative z-10">
           <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
             <Calendar className="text-brand-lime" />
             Yearly Operational Archive
           </h3>
           <p className="text-zinc-400">Access data from previous operational years (2024 - 2025).</p>
        </div>
        <Button className="bg-brand-lime text-brand-purple hover:bg-brand-lime/90 font-bold px-8 h-12 relative z-10">
          Browse Archive
        </Button>
        <div className="absolute -left-20 -bottom-20 opacity-10">
           <FileText size={300} />
        </div>
      </motion.div>
    </div>
  );
}
