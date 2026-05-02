"use client";

import { useEffect, useState } from "react";
import { roReportApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Droplets, 
  Download, 
  ArrowLeft, 
  Calendar,
  Waves,
  FileSpreadsheet,
  Activity,
  Beaker
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuth } from "@/providers/auth-provider";
import { 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export default function RoReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchReports = async () => {
      try {
        const response = await roReportApi.getAll();
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch RO reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const chartData = [...reports]
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
    .map(r => ({
      ...r,
      date: new Date(r.reportDate).getTime(),
      swProd: r.tanks?.swProductionM3hr || 0,
      dmProd: r.tanks?.dmProductionM3hr || 0,
      swA: r.tanks?.swAM3 || 0,
      swB: r.tanks?.swBM3 || 0,
      dmA: r.tanks?.dmAM3 || 0,
      dmB: r.tanks?.dmBM3 || 0,
    }));

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RO Report Summary');
    
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Shift', key: 'shift', width: 10 },
      { header: 'SW Production (m3/h)', key: 'swProd', width: 20 },
      { header: 'DM Production (m3/h)', key: 'dmProd', width: 20 },
      { header: 'SW Tank A (m3)', key: 'swA', width: 15 },
      { header: 'SW Tank B (m3)', key: 'swB', width: 15 },
      { header: 'DM Tank A (m3)', key: 'dmA', width: 15 },
      { header: 'DM Tank B (m3)', key: 'dmB', width: 15 },
    ];

    reports.forEach(report => {
      worksheet.addRow({
        date: new Date(report.reportDate).toLocaleDateString('en-GB'),
        shift: report.shift,
        swProd: report.tanks?.swProductionM3hr || 0,
        dmProd: report.tanks?.dmProductionM3hr || 0,
        swA: report.tanks?.swAM3 || 0,
        swB: report.tanks?.swBM3 || 0,
        dmA: report.tanks?.dmAM3 || 0,
        dmB: report.tanks?.dmBM3 || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `QIPP_RO_Report_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lilac" />
     </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/reports" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <div className="p-2 bg-muted rounded-lg group-hover:bg-brand-lilac/10 group-hover:text-brand-lilac">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-xs">Back to Hub</span>
        </Link>
        {user?.role === 'admin' && (
          <div className="flex gap-3">
             <Button onClick={exportToExcel} variant="outline" className="gap-2 rounded-xl border-brand-lilac/20 text-brand-lilac">
               <FileSpreadsheet size={18} />
               Export Summary
             </Button>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-purple p-10 rounded-[40px] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="relative z-10">
           <div className="flex items-center gap-3 text-brand-lime mb-4">
              <Droplets size={24} />
              <span className="font-black uppercase tracking-[0.2em] text-sm">Water Treatment Plant</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-4">RO & Chemical <br/> Performance</h1>
           <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
             Real-time monitoring of reverse osmosis units, mixed bed demineralizers, and strategic tank levels.
           </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative z-10">
           <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">WTP Availability</span>
           <span className="text-7xl font-black text-brand-lime">100%</span>
           <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-brand-lime/10 rounded-full">
              <Waves size={14} className="text-brand-lime" />
              <span className="text-[10px] font-bold text-brand-lime capitalize">Optimal Production</span>
           </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
           <Droplets size={400} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Activity className="text-brand-lime" size={20} />
             Water Production Trend (m³/h)
           </h2>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorSw" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#D2F050" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#D2F050" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorDm" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#9273DA" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#9273DA" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis 
                       dataKey="date" 
                       type="number"
                       domain={['auto', 'auto']}
                       tickFormatter={(t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                     />
                     <YAxis />
                     <Tooltip 
                        labelFormatter={(t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                     />
                     <Legend />
                     <Area name="SW Production" type="monotone" dataKey="swProd" stroke="#D2F050" fillOpacity={1} fill="url(#colorSw)" strokeWidth={3} />
                     <Area name="DM Production" type="monotone" dataKey="dmProd" stroke="#9273DA" fillOpacity={1} fill="url(#colorDm)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>

        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Beaker className="text-brand-lilac" size={20} />
             Strategic Tank Levels (m³)
           </h2>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis 
                       dataKey="date" 
                       type="number"
                       domain={['auto', 'auto']}
                       tickFormatter={(t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                     />
                     <YAxis />
                     <Tooltip 
                        labelFormatter={(t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                     />
                     <Legend />
                     <Line name="SW Tank A" type="monotone" dataKey="swA" stroke="#D2F050" strokeWidth={2} dot={false} />
                     <Line name="SW Tank B" type="monotone" dataKey="swB" stroke="#84cc16" strokeWidth={2} dot={false} />
                     <Line name="DM Tank A" type="monotone" dataKey="dmA" stroke="#9273DA" strokeWidth={2} dot={false} />
                     <Line name="DM Tank B" type="monotone" dataKey="dmB" stroke="#c084fc" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>
      </div>

      <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
        <div className="p-6 border-b bg-muted/20 flex justify-between items-center">
           <h3 className="font-bold flex items-center gap-2">
             <Calendar size={18} className="text-brand-lilac" />
             Recent Daily Reports
           </h3>
           <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
             {reports.length} Reports Found
           </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Date</th>
                <th className="p-4">Shift</th>
                <th className="p-4">SW Production</th>
                <th className="p-4">DM Production</th>
                <th className="p-4">Tank SW (A/B)</th>
                <th className="p-4">Tank DM (A/B)</th>
                <th className="p-4">Activity Log</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{new Date(report.reportDate).toLocaleDateString('en-GB')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.shift === 'N' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {report.shift === 'N' ? 'NIGHT' : 'DAY'}
                    </span>
                  </td>
                  <td className="p-4">{report.tanks?.swProductionM3hr?.toFixed(1)} m³/h</td>
                  <td className="p-4">{report.tanks?.dmProductionM3hr?.toFixed(1)} m³/h</td>
                  <td className="p-4">
                    <div className="flex flex-col text-[10px] font-bold">
                       <span className="text-brand-lime">A: {report.tanks?.swAM3?.toFixed(0)}m³</span>
                       <span className="text-zinc-500">B: {report.tanks?.swBM3?.toFixed(0)}m³</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col text-[10px] font-bold">
                       <span className="text-brand-lilac">A: {report.tanks?.dmAM3?.toFixed(0)}m³</span>
                       <span className="text-zinc-500">B: {report.tanks?.dmBM3?.toFixed(0)}m³</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-muted-foreground italic truncate max-w-[200px] block">
                      {report.activities?.[0]?.description || "No entries recorded"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
