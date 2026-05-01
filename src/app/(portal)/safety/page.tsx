"use client";

import { useEffect, useState } from "react";
import { safetyApi } from "@/lib/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Search, 
  FileText,
  ShieldCheck,
  AlertTriangle,
  History,
  Plus,
  Info,
  BarChart3,
  LayoutGrid,
  Lock,
  Zap,
  MapPin,
  ClipboardList
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ['#9273DA', '#D2F050', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6'];

export default function SafetyCommandCenter() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"overview" | "registry">("overview");
  const [activeTab, setActiveTab] = useState("permits");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [registryData, setRegistryData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await safetyApi.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  const fetchRegistry = async (tab: string) => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "permits": res = await safetyApi.getPermits(); break;
        case "jha": res = await safetyApi.getJhas(); break;
        case "work-orders": res = await safetyApi.getWorkOrders(); break;
        case "loto": res = await safetyApi.getLotoSafes(); break;
        case "isolation": res = await safetyApi.getIsolationPoints(); break;
        default: res = await safetyApi.getPermits();
      }
      setRegistryData(res.data);
    } catch (err) {
      toast.error(`Failed to fetch ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeView === "registry") {
      fetchRegistry(activeTab);
    }
  }, [activeView, activeTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await safetyApi.updatePermit(id, { 
        status, 
        authorizedBy: user?.name || user?.email || "System Admin" 
      });
      toast.success(`Permit status updated: ${status}`);
      fetchRegistry(activeTab);
      fetchDashboard();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (['issued', 'active', 'approved', 'available'].includes(s)) 
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (['pending', 'prepared', 'in preparation', 'raised', 'submitted', 'in use'].includes(s)) 
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    if (['closed', 'surrendered', 'cancelled', 'not required', 'not issued'].includes(s)) 
      return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700";
    if (['suspended', 'secured', 'high', 'shutdown'].includes(s)) 
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    return "bg-zinc-100 text-zinc-800 border-zinc-200";
  };

  const filteredData = registryData.filter(item => {
    const searchStr = search.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchStr)
    );
  });

  const renderChart = (title: string, dataObj: any) => {
    if (!dataObj) return null;
    const data = Object.entries(dataObj).map(([name, value]) => ({ name, value }));
    
    return (
      <Card className="p-4 border bg-white dark:bg-card flex flex-col h-[280px]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  const renderBarChart = (title: string, dataObj: any) => {
    if (!dataObj) return null;
    const data = Object.entries(dataObj).filter(([name]) => name).map(([name, value]) => ({ name, value }));
    
    return (
      <Card className="p-4 border bg-white dark:bg-card flex flex-col h-[280px]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" fill="#9273DA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-[#F9F7FC] dark:bg-transparent min-h-screen">
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-brand-lilac h-6 w-6" />
            <h1 className="text-2xl font-extrabold text-[#2E2044] dark:text-white tracking-tight">
              Safety Command Center
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            ACWA Power QIPP • Real-time Safety Control of Work Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-card p-1 rounded-xl border shadow-sm">
          <Button 
            variant={activeView === "overview" ? "default" : "ghost"}
            className={cn(
              "rounded-lg h-9 px-4 text-xs font-bold gap-2",
              activeView === "overview" && "bg-brand-lilac hover:bg-brand-lilac/90"
            )}
            onClick={() => setActiveView("overview")}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant={activeView === "registry" ? "default" : "ghost"}
            className={cn(
              "rounded-lg h-9 px-4 text-xs font-bold gap-2",
              activeView === "registry" && "bg-brand-lilac hover:bg-brand-lilac/90"
            )}
            onClick={() => setActiveView("registry")}
          >
            <LayoutGrid className="h-4 w-4" />
            Registry
          </Button>
        </div>
      </div>

      {/* KPI TOP ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Permits", val: dashboardData?.counts?.permits || 0, sub: "Main & Supps", icon: FileText, color: "border-l-[#9273DA]" },
          { label: "JHAs Approved", val: dashboardData?.counts?.jha || 0, sub: "Hazard Analyses", icon: ShieldCheck, color: "border-l-[#D2F050]" },
          { label: "Work Orders", val: dashboardData?.counts?.workOrders || 0, sub: "To Assess / All", icon: ClipboardList, color: "border-l-[#F59E0B]" },
          { label: "LOTO Safes", val: dashboardData?.counts?.loto || 0, sub: "Key Box Summary", icon: Lock, color: "border-l-[#10B981]" },
          { label: "Iso Points", val: dashboardData?.counts?.isolationPoints || 0, sub: "Active Methods", icon: Zap, color: "border-l-[#EF4444]" },
          { label: "Locations", val: 100, sub: "Plant Areas", icon: MapPin, color: "border-l-[#3B82F6]" },
        ].map((kpi, i) => (
          <Card key={i} className={cn("p-4 border bg-white dark:bg-card relative overflow-hidden rounded-xl border-l-4", kpi.color)}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[24px] font-black text-[#2E2044] dark:text-white leading-none">{kpi.val}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{kpi.label}</p>
                <p className="text-[9px] text-[#A899C4] mt-1">{kpi.sub}</p>
              </div>
              <kpi.icon className="h-4 w-4 text-[#A899C4]" />
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === "overview" ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {renderChart("Permit Status (Main)", dashboardData?.stats?.permitStatus)}
            {renderChart("Permit Type (Main)", dashboardData?.stats?.permitType)}
            {renderChart("Supplemental Type", dashboardData?.stats?.suppType)}
            {renderChart("JHA Status", dashboardData?.stats?.jhaStatus)}
            {renderBarChart("Work Priority", dashboardData?.stats?.workPriority)}
            {renderChart("Key Safe Status", dashboardData?.stats?.ksStatus)}
            {renderChart("Isolation Method", dashboardData?.stats?.isoMethod)}
            {renderChart("Supplemental Status", dashboardData?.stats?.suppStatus)}
          </motion.div>
        ) : (
          <motion.div 
            key="registry"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="bg-white dark:bg-card border h-10 p-1 rounded-xl">
                  <TabsTrigger value="permits" className="rounded-lg text-[11px] font-bold px-4 data-[state=active]:bg-brand-lilac data-[state=active]:text-white">Permits</TabsTrigger>
                  <TabsTrigger value="jha" className="rounded-lg text-[11px] font-bold px-4 data-[state=active]:bg-brand-lilac data-[state=active]:text-white">JHA</TabsTrigger>
                  <TabsTrigger value="work-orders" className="rounded-lg text-[11px] font-bold px-4 data-[state=active]:bg-brand-lilac data-[state=active]:text-white">Work Orders</TabsTrigger>
                  <TabsTrigger value="loto" className="rounded-lg text-[11px] font-bold px-4 data-[state=active]:bg-brand-lilac data-[state=active]:text-white">LOTO Safes</TabsTrigger>
                  <TabsTrigger value="isolation" className="rounded-lg text-[11px] font-bold px-4 data-[state=active]:bg-brand-lilac data-[state=active]:text-white">Isolation</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search all fields..." 
                    className="pl-9 w-64 md:w-72 bg-white dark:bg-card border-border h-10 rounded-xl text-xs font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-lilac hover:bg-brand-lilac/90 text-white gap-2 font-bold h-10 px-5 rounded-xl shadow-sm text-xs">
                      <Plus className="h-4 w-4" />
                      New Permit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">New Work Authorization</DialogTitle>
                      <DialogDescription className="text-xs">
                        Submit a new permit-to-work request for authorization and hazard assessment.
                      </DialogDescription>
                    </DialogHeader>
                    {/* Expanded Form to match Backend Models */}
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">Permit Type</Label>
                          <Select defaultValue="Standard">
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">PERMIT (Standard)</SelectItem>
                              <SelectItem value="Access">PERMIT (Access)</SelectItem>
                              <SelectItem value="Hot">Hot Work Permit</SelectItem>
                              <SelectItem value="Confined">Confined Space</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">Equipment No</Label>
                          <Input placeholder="e.g. 10-H-001" className="h-9 text-xs" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">Location / Area</Label>
                          <Input placeholder="e.g. Boiler Area" className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">Plant Summary</Label>
                          <Input placeholder="Unit/Block..." className="h-9 text-xs" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold">Work Description</Label>
                        <Input placeholder="Detailed scope of activities..." className="h-9 text-xs" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">Contractor</Label>
                          <Input placeholder="e.g. NOMAC" className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold">No. of Workers</Label>
                          <Input type="number" placeholder="0" className="h-9 text-xs" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-brand-lilac">Valid From</Label>
                          <Input type="datetime-local" className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-brand-lilac">Valid To</Label>
                          <Input type="datetime-local" className="h-9 text-xs" />
                        </div>
                      </div>

                      <Button className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-bold h-11 shadow-md" onClick={() => {
                        toast.success("Permit request submitted for approval");
                        setIsRequestOpen(false);
                      }}>Submit Work Request</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="border shadow-sm rounded-xl bg-white dark:bg-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-[#2E2044] sticky top-0 z-10">
                    <TableRow className="border-none hover:bg-transparent">
                      {activeTab === "permits" && (
                        <>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider px-4 h-11">Doc No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Status</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Type</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Equipment</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11 w-[30%]">Work Description</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Location</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Valid From</TableHead>
                        </>
                      )}
                      {activeTab === "jha" && (
                        <>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider px-4 h-11">JHA No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Status</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Type</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Equipment No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11 w-[30%]">Work Description</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Location</TableHead>
                        </>
                      )}
                      {activeTab === "work-orders" && (
                        <>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider px-4 h-11">WO No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Status</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Priority</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Equipment</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11 w-[40%]">Work Description</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Plan Finish</TableHead>
                        </>
                      )}
                      {activeTab === "loto" && (
                        <>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider px-4 h-11">Safe No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Status</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11 w-[40%]">Description</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Keys</TableHead>
                        </>
                      )}
                      {activeTab === "isolation" && (
                        <>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider px-4 h-11">Iso No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Equipment No</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11">Method</TableHead>
                          <TableHead className="text-[10px] font-bold text-white uppercase tracking-wider h-11 w-[50%]">Description</TableHead>
                        </>
                      )}
                      <TableHead className="text-right px-6 text-[10px] font-bold text-white uppercase tracking-wider h-11">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-64 text-center">
                           <div className="flex flex-col items-center gap-2">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lilac" />
                             <p className="text-xs font-bold text-muted-foreground animate-pulse">Syncing Registry Data...</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-64 text-center text-muted-foreground text-xs italic font-medium">
                          No matching records found in database.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-[#F3F0F9] dark:hover:bg-muted/5 transition-colors border-border">
                          {activeTab === "permits" && (
                            <>
                              <TableCell className="font-bold text-[11px] text-brand-lilac px-4">{item.permitId}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5", getStatusBadge(item.status))}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-bold text-muted-foreground">{item.type}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.equipmentNo}</TableCell>
                              <TableCell className="text-[10px] leading-tight text-muted-foreground font-medium max-w-[300px] truncate" title={item.description}>{item.description}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.location}</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{item.validFrom ? format(new Date(item.validFrom), "dd MMM yy HH:mm") : "-"}</TableCell>
                            </>
                          )}
                          {activeTab === "jha" && (
                            <>
                              <TableCell className="font-bold text-[11px] text-brand-lilac px-4">{item.jhaNo}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5", getStatusBadge(item.status))}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-bold text-muted-foreground">{item.jhaType}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.equipmentNo}</TableCell>
                              <TableCell className="text-[10px] leading-tight text-muted-foreground font-medium max-w-[300px] truncate">{item.workDesc}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.location}</TableCell>
                            </>
                          )}
                          {activeTab === "work-orders" && (
                            <>
                              <TableCell className="font-bold text-[11px] text-brand-lilac px-4">{item.woNo}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5", getStatusBadge(item.status))}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5", getStatusBadge(item.priority))}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-bold">{item.equipmentNo}</TableCell>
                              <TableCell className="text-[10px] leading-tight text-muted-foreground font-medium max-w-[400px] truncate">{item.workDesc}</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{item.planFinish ? format(new Date(item.planFinish), "dd MMM yy") : "-"}</TableCell>
                            </>
                          )}
                          {activeTab === "loto" && (
                            <>
                              <TableCell className="font-bold text-[11px] text-brand-lilac px-4">{item.keySafeNo}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5", getStatusBadge(item.status))}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] leading-tight text-muted-foreground font-medium max-w-[500px]">{item.description}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.keys?.length || 0} Keys</TableCell>
                            </>
                          )}
                          {activeTab === "isolation" && (
                            <>
                              <TableCell className="font-bold text-[11px] text-brand-lilac px-4">{item.isolationPointNo}</TableCell>
                              <TableCell className="text-[10px] font-bold">{item.equipmentNo}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-100 text-zinc-800 border-zinc-200">
                                  {item.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] leading-tight text-muted-foreground font-medium max-w-[600px]">{item.description}</TableCell>
                            </>
                          )}
                          <TableCell className="text-right px-6">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-brand-lilac rounded-lg">
                                <Info size={14} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-brand-lilac rounded-lg">
                                <FileText size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
