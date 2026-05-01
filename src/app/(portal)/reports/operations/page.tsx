"use client";

import { useEffect, useState } from "react";
import { kpiApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Download, 
  ArrowLeft, 
  Calendar,
  Zap,
  Droplets,
  Flame,
  TrendingUp,
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
  Legend,
  ComposedChart
} from "recharts";

export default function OperationsReportPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const response = await kpiApi.getLatest({ days: 30 }); // Default to last 30 days
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch operations data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats Calculations
  const totalNetGen = data.reduce((acc, curr) => acc + (curr.netGen || 0), 0);
  const avgHeatRate = data.length > 0 ? data.reduce((acc, curr) => acc + (curr.heatRate || 0), 0) / data.length : 0;
  const avgPLF = data.length > 0 ? data.reduce((acc, curr) => acc + (curr.plf || 0), 0) / data.length : 0;
  const totalWater = data.reduce((acc, curr) => acc + (curr.water?.roProduction || 0), 0);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Operations Report');
    
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Generation (MWh)', key: 'gen', width: 18 },
      { header: 'Net Gen (MWh)', key: 'netGen', width: 18 },
      { header: 'PLF (%)', key: 'plf', width: 12 },
      { header: 'Heat Rate (kcal/kWh)', key: 'heatRate', width: 20 },
      { header: 'Efficiency (%)', key: 'efficiency', width: 15 },
      { header: 'Fuel (MMBTU)', key: 'fuel', width: 15 },
      { header: 'RO Water (m³)', key: 'water', width: 15 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        date: new Date(item.date).toLocaleDateString('en-GB'),
        gen: item.generation || 0,
        netGen: item.netGen || 0,
        plf: item.plf || 0,
        heatRate: item.heatRate || 0,
        efficiency: item.efficiency || 0,
        fuel: item.fuel || 0,
        water: item.water?.roProduction || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `QIPP_Operations_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        className="bg-[#2E2044] p-10 rounded-[40px] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="relative z-10">
           <div className="flex items-center gap-3 text-brand-lilac mb-4">
              <Activity size={24} />
              <span className="font-black uppercase tracking-[0.2em] text-sm">Performance Analysis</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-4">Operations <br/> Monthly</h1>
           <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
             Consolidated view of plant efficiency, thermal performance, and resource utilization.
           </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Net Gen</p>
              <p className="text-2xl font-black text-brand-lime">{(totalNetGen / 1000).toFixed(1)} <span className="text-xs">GWh</span></p>
           </div>
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Avg Heat Rate</p>
              <p className="text-2xl font-black text-brand-lilac">{avgHeatRate.toFixed(0)} <span className="text-xs">kcal</span></p>
           </div>
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Avg PLF</p>
              <p className="text-2xl font-black text-sky-400">{avgPLF.toFixed(1)}<span className="text-xs">%</span></p>
           </div>
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Water Prod.</p>
              <p className="text-2xl font-black text-emerald-400">{(totalWater / 1000).toFixed(1)} <span className="text-xs">k.m³</span></p>
           </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
           <Activity size={400} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                Gen vs Fuel Consumption
              </h2>
           </div>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="date" tickFormatter={(t) => t.split('-')[2]} fontSize={10} />
                     <YAxis yAxisId="left" fontSize={10} />
                     <YAxis yAxisId="right" orientation="right" fontSize={10} />
                     <Tooltip />
                     <Legend />
                     <Area yAxisId="left" type="monotone" dataKey="generation" fill="#9273DA" stroke="#9273DA" fillOpacity={0.1} name="Gen (MWh)" />
                     <Line yAxisId="right" type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={3} name="Fuel (MMBTU)" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>

        <Card className="p-8 bg-card border rounded-3xl shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-brand-lime" size={20} />
                Thermal Efficiency Trend
              </h2>
           </div>
            <div className="h-[300px] min-w-0 min-h-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="date" tickFormatter={(t) => t.split('-')[2]} fontSize={10} />
                     <YAxis yAxisId="left" fontSize={10} domain={['auto', 'auto']} />
                     <YAxis yAxisId="right" orientation="right" fontSize={10} domain={['auto', 'auto']} />
                     <Tooltip />
                     <Legend />
                     <Line yAxisId="left" type="monotone" dataKey="heatRate" stroke="#EF4444" strokeWidth={3} name="Heat Rate" />
                     <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#D2F050" strokeWidth={3} name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
        </Card>
      </div>

      <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
        <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2">
             <Calendar size={18} className="text-brand-lilac" />
             Operational Logbook (Last 30 Days)
           </h3>
           <Badge variant="outline" className="text-[10px]">{data.length} Records</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Date</th>
                <th className="p-4 text-brand-lilac">Gen (MWh)</th>
                <th className="p-4">Load (MW)</th>
                <th className="p-4">PLF (%)</th>
                <th className="p-4">Heat Rate</th>
                <th className="p-4">Efficiency</th>
                <th className="p-4 text-orange-400">Fuel</th>
                <th className="p-4 text-sky-400">Water (m³)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors text-xs font-medium">
                  <td className="p-4">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                  <td className="p-4 font-bold">{(row.generation || 0).toLocaleString()}</td>
                  <td className="p-4">{row.load?.toFixed(1)}</td>
                  <td className="p-4">{row.plf?.toFixed(1)}%</td>
                  <td className="p-4">{row.heatRate?.toFixed(0)}</td>
                  <td className="p-4">{row.efficiency?.toFixed(2)}%</td>
                  <td className="p-4">{row.fuel?.toFixed(0)}</td>
                  <td className="p-4">{row.water?.roProduction?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
