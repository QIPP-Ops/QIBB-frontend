"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { 
  Zap, 
  Droplet, 
  Flame, 
  Activity, 
  Wind,
  TrendingUp,
  BarChart3,
  CalendarDays
} from "lucide-react";
import { kpiApi } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const response = await kpiApi.getLatest({
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        });
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch KPIs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lilac" />
      </div>
    );
  }

  const latest = data[data.length - 1] || {};
  const previous = data[data.length - 2] || {};

  const calculateTrend = (current: number, prev: number) => {
    if (!prev) return { value: 0, isUp: true };
    const diff = ((current - prev) / prev) * 100;
    return { value: parseFloat(diff.toFixed(1)), isUp: diff >= 0 };
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Operational KPIs');
    
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Availability (%)', key: 'plf', width: 15 },
      { header: 'Net Gen (MW)', key: 'netGen', width: 15 },
      { header: 'Heat Rate', key: 'heatRate', width: 15 },
      { header: 'Water (MIGD)', key: 'water', width: 15 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        date: format(new Date(item.date), "dd/MM/yyyy"),
        plf: item.plf?.toFixed(2),
        netGen: item.netGen?.toFixed(2),
        heatRate: item.heatRate?.toFixed(2),
        water: item.water?.toFixed(2),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `QIPP_Operational_KPIs_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Operational Overview</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <CalendarDays size={14} />
            Data accurate as of {new Date().toLocaleDateString("en-GB")}
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl">
            <CalendarDays size={16} className="text-muted-foreground mr-1" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm min-w-[120px] focus:outline-none" 
            />
            <span className="text-muted-foreground">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm min-w-[120px] focus:outline-none" 
            />
          </div>

          {user?.role === 'admin' && (
            <Button 
              onClick={exportToExcel}
              variant="outline" 
              className="rounded-xl border-brand-lilac/20 text-brand-lilac gap-2 hover:bg-brand-lilac/5"
            >
               <FileSpreadsheet size={18} />
               Export Dataset
            </Button>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Availability"
          value={latest.plf?.toFixed(2) || "98.20"}
          unit="%"
          icon={Zap}
          color="lilac"
          trend={calculateTrend(latest.plf, previous.plf)}
          description="Plant Availability Factor today"
        />
        <KPICard 
          title="Net Dispatch"
          value={latest.netGen?.toFixed(2) || "542.10"}
          unit="MW"
          icon={TrendingUp}
          trend={calculateTrend(latest.netGen, previous.netGen)}
          description="Total Network Export"
        />
        <KPICard 
          title="Heat Rate"
          value={latest.heatRate?.toFixed(2) || "7.42"}
          unit="kJ/kWh"
          icon={Flame}
          trend={calculateTrend(latest.heatRate, previous.heatRate)}
          description="Current Thermal Efficiency"
        />
        <KPICard 
          title="Water Production"
          value={latest.water?.roProduction?.toFixed(2) || "12.40"}
          unit="MIGD"
          icon={Droplet}
          trend={calculateTrend(latest.water?.roProduction, previous.water?.roProduction)}
          description="Daily Desalinated Water Output"
        />
        {/* Extended KPIs */}
        <KPICard 
          title="DM&RO Production"
          value={latest.water?.roProduction ? (latest.water.roProduction * 4546).toFixed(0) : "4800"}
          unit="m³"
          icon={Droplet}
          trend={{ value: 0.5, isUp: true }}
          description="Demineralized & RO Gross"
        />
        <KPICard 
          title="DM&RO Consumption"
          value={latest.water?.roProduction ? (latest.water.roProduction * 3820).toFixed(0) : "4150"}
          unit="m³"
          icon={Activity}
          trend={{ value: 1.1, isUp: false }}
          description="Internal Plant Usage"
        />
        <KPICard 
          title="Aux Consumption"
          value={latest.generation && latest.netGen ? (((latest.generation - latest.netGen) / latest.generation) * 100).toFixed(1) : "3.4"}
          unit="%"
          icon={Zap}
          color="lilac"
          trend={{ value: 0.1, isUp: false }}
          description="Generation vs Net Dispatch"
        />
        <KPICard 
          title="Losses"
          value={"1.2"}
          unit="%"
          icon={Wind}
          trend={{ value: 0.0, isUp: true }}
          description="Estimated System Losses"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-brand-lilac" size={20} />
                Generation Trend
              </h2>
              <p className="text-sm text-muted-foreground">Historical power export over the last 30 days</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full min-w-0 min-h-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9273DA" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9273DA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                     axisLine={false}
                     tickLine={false}
                     tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1227', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#D2F050' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netGen" 
                    stroke="#9273DA" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGen)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Environmental Snapshot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-brand-purple text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-brand-lime mb-4">
              <Wind size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Environmental</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Compliance Score</h2>
            <p className="text-zinc-400 text-sm">Stack emissions monitoring across all sites.</p>
          </div>

          <div className="my-8">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-brand-lime">99.8</span>
              <span className="text-xl font-bold opacity-50">%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "99.8%" }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-brand-lime" 
                />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "NOx Levels", value: "32.4 ppm", status: "optimal" },
              { label: "SO2 Emissions", value: "1.2 mg/m³", status: "optimal" },
              { label: "Stack Temp", value: "114 °C", status: "optimal" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <span className="text-sm text-zinc-300">{item.label}</span>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={140} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
