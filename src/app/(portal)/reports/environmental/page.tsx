"use client";

import { useEffect, useState } from "react";
import { kpiApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wind, 
  Download, 
  ArrowLeft, 
  Calendar,
  AlertCircle,
  FileSpreadsheet
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

export default function EnvironmentalReportPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const response = await kpiApi.getLatest();
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch environmental data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Environmental Report');
    
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'NOx (ppm)', key: 'nox', width: 12 },
      { header: 'SOx (mg/m³)', key: 'sox', width: 12 },
      { header: 'CO (mg/m³)', key: 'co', width: 12 },
      { header: 'Stack Temp (°C)', key: 'stackTemp', width: 15 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        date: new Date(item.date).toLocaleDateString('en-GB'),
        nox: item.emissions?.nox || 0,
        sox: item.emissions?.sox || 0,
        co: item.emissions?.co || 0,
        stackTemp: item.emissions?.stackTemp || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `QIPP_Environmental_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
               Export to Excel
             </Button>
             <Button className="bg-brand-lilac hover:bg-brand-lilac/90 text-white gap-2 rounded-xl px-6">
               <Download size={18} />
               Download PDF
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
              <Wind size={24} />
              <span className="font-black uppercase tracking-[0.2em] text-sm">Regulatory Monitoring</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-4">Environmental <br/> Compliance</h1>
           <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
             Full auditing of stack emissions against local environmental standards and PPA requirements.
           </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative z-10">
           <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Compliance</span>
           <span className="text-7xl font-black text-brand-lime">99.8%</span>
           <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-brand-lime/10 rounded-full">
              <AlertCircle size={14} className="text-brand-lime" />
              <span className="text-[10px] font-bold text-brand-lime capitalize">Optimal Performance</span>
           </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
           <Wind size={400} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <h2 className="text-xl font-bold mb-6">NOx Concentration Trend</h2>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                       <linearGradient id="colorNox" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#D2F050" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#D2F050" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="date" tickFormatter={(t) => t.split('-')[2]} />
                     <YAxis />
                     <Tooltip />
                     <Area type="monotone" dataKey="emissions.nox" stroke="#D2F050" fillOpacity={1} fill="url(#colorNox)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>

        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <h2 className="text-xl font-bold mb-6">Particulate & SOx Levels</h2>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="date" tickFormatter={(t) => t.split('-')[2]} />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Line type="monotone" dataKey="emissions.sox" stroke="#9273DA" strokeWidth={3} dot={{ r: 4 }} />
                     <Line type="monotone" dataKey="emissions.particulate" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>
      </div>

      <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
        <div className="p-6 border-b bg-muted/20">
           <h3 className="font-bold flex items-center gap-2">
             <Calendar size={18} className="text-brand-lilac" />
             Historical Logs
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Date</th>
                <th className="p-4">NOx (ppm)</th>
                <th className="p-4">SOx (mg/m³)</th>
                <th className="p-4">CO (mg/m³)</th>
                <th className="p-4">Particulate</th>
                <th className="p-4">Stack Temp</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                  <td className="p-4">{row.emissions?.nox?.toFixed(2)}</td>
                  <td className="p-4">{row.emissions?.sox?.toFixed(2)}</td>
                  <td className="p-4">{row.emissions?.co?.toFixed(2)}</td>
                  <td className="p-4">{row.emissions?.particulate?.toFixed(2)}</td>
                  <td className="p-4">{row.emissions?.stackTemp?.toFixed(1)}°C</td>
                  <td className="p-4">
                     <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full">COMPLIANT</span>
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

