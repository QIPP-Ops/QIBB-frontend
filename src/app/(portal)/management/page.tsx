"use client";

import { useEffect, useState } from "react";
import { rosterApi, adminApi } from "@/lib/api";
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
  DialogFooter
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
  Search, 
  UserPlus, 
  Trash2, 
  Edit2,
  Users,
  Loader2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";

export default function ManagementPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Dynamic Metadata
  const [crews, setCrews] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // Edit state
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Delete confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmInput] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await rosterApi.getEmployees();
      setEmployees(response.data);
    } catch (err) {
      toast.error("Failed to fetch personnel data");
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await adminApi.getConfig();
      if (response.data) {
        setCrews(response.data.availableCrews || []);
        setRoles(response.data.availableRoles || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch metadata:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchMetadata()]);
      setLoading(false);
    };
    init();
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({
    name: "",
    empId: "",
    crew: "",
    role: ""
  });

  // Update defaults when metadata arrives
  useEffect(() => {
    if (crews.length && roles.length) {
      setNewPersonnel(prev => ({
        ...prev,
        crew: crews[0],
        role: roles[0]
      }));
    }
  }, [crews, roles]);

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rosterApi.createEmployee({
        ...newPersonnel,
        leaves: []
      });
      toast.success("Personnel added to roster");
      setIsAddOpen(false);
      setNewPersonnel({ name: "", empId: "", crew: crews[0] || "", role: roles[0] || "" });
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add personnel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());
    const matchesCrew = crewFilter === "all" || emp.crew === crewFilter;
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesSearch && matchesCrew && matchesRole;
  });

  const confirmDelete = (emp: any) => {
    setPersonnelToDelete(emp);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!personnelToDelete) return;
    
    setIsSubmitting(true);
    try {
      await rosterApi.deleteEmployee(personnelToDelete.empId);
      setEmployees(employees.filter(e => e.empId !== personnelToDelete.empId));
      toast.success("Personnel and associated system account deleted.");
      setIsDeleteOpen(false);
      setPersonnelToDelete(null);
    } catch (err) {
      toast.error("Failed to remove personnel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (emp: any) => {
    setEditingEmployee({ ...emp });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setIsSubmitting(true);
    try {
      await rosterApi.updateEmployee(editingEmployee.empId, editingEmployee);
      toast.success("Personnel updated successfully");
      setIsEditOpen(false);
      fetchEmployees(); // Refresh list
    } catch (err) {
      toast.error("Failed to update personnel");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lilac" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <Users className="text-brand-lilac h-8 w-8" />
            Personnel Management
          </h1>
          <p className="text-muted-foreground mt-1">Oversee and manage operational staff roster and assignments.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Select value={crewFilter} onValueChange={setCrewFilter}>
              <SelectTrigger className="w-[120px] rounded-xl">
                <SelectValue placeholder="All Crews" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Crews</SelectItem>
                {crews.map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-9 w-64 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-lime hover:bg-brand-lime/90 text-brand-purple font-black rounded-xl px-6 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Personnel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add New Personnel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPersonnel} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                    <Input 
                      className="bg-white/5 border-white/10 h-12 text-white rounded-xl"
                      placeholder="e.g. Mohammad Algarni" 
                      value={newPersonnel.name}
                      onChange={(e) => setNewPersonnel({...newPersonnel, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personnel ID</Label>
                    <Input 
                      className="bg-white/5 border-white/10 h-12 text-white rounded-xl"
                      placeholder="e.g. 500123" 
                      value={newPersonnel.empId}
                      onChange={(e) => setNewPersonnel({...newPersonnel, empId: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crew Assignment</Label>
                      <Select 
                        value={newPersonnel.crew} 
                        onValueChange={(val) => setNewPersonnel({...newPersonnel, crew: val})}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                          {crews.map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Designation</Label>
                      <Select 
                        value={newPersonnel.role} 
                        onValueChange={(val) => setNewPersonnel({...newPersonnel, role: val})}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                          {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black h-12 rounded-xl mt-4 uppercase tracking-widest shadow-lg shadow-brand-lilac/20"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Save to Roster"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Staff</p>
          <p className="text-2xl font-bold">{employees.length}</p>
        </Card>
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Active Crews</p>
          <p className="text-2xl font-bold">{crews.length}</p>
        </Card>
      </div>

      {/* Simple Table */}
      <Card className="overflow-hidden border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Employee ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Crew</TableHead>
              <TableHead>Role</TableHead>
              {user && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.empId}>
                <TableCell className="font-mono text-xs text-muted-foreground">{emp.empId}</TableCell>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "font-bold",
                    emp.crew === 'A' && "border-blue-500 text-blue-500",
                    emp.crew === 'B' && "border-orange-500 text-orange-500",
                    emp.crew === 'C' && "border-emerald-500 text-emerald-500",
                    emp.crew === 'D' && "border-brand-lilac text-brand-lilac",
                    emp.crew === 'S' && "border-zinc-500 text-zinc-500",
                  )}>
                    {emp.crew}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{emp.role}</TableCell>
                {user && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        onClick={() => openEdit(emp)}
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => confirmDelete(emp)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No personnel found matching your search.
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Personnel</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                <Input 
                  className="bg-white/5 border-white/10 h-11 text-white rounded-xl"
                  value={editingEmployee.name} 
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Employee ID (Read-only)</Label>
                <Input className="bg-white/5 border-white/10 h-11 text-white rounded-xl opacity-50" value={editingEmployee.empId} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crew</Label>
                  <Select 
                    value={editingEmployee.crew} 
                    onValueChange={(val) => setEditingEmployee({...editingEmployee, crew: val})}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {crews.map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</Label>
                  <Select 
                    value={editingEmployee.role} 
                    onValueChange={(val) => setEditingEmployee({...editingEmployee, role: val})}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl border-white/10 text-white hover:bg-white/5">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-brand-lilac hover:bg-brand-lilac/90 text-white font-black rounded-xl px-8">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Hard Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-white/5 text-white rounded-[2rem]">
          <DialogHeader>
            <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
               <Trash2 size={24} />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Confirm Hard Delete</DialogTitle>
            <DialogDescription className="text-zinc-500">
               This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
             <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <p className="text-sm text-rose-200 font-medium leading-relaxed">
                   Deleteting <span className="font-black text-white underline">{personnelToDelete?.name}</span> will:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-rose-200/70 list-disc list-inside">
                   <li>Permanently remove their roster entry</li>
                   <li>Hard-delete their system login account</li>
                   <li>Wipe all historical leave data for this ID</li>
                </ul>
             </div>
             
             <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest text-center">
                Type the Personnel ID <span className="text-white">"{personnelToDelete?.empId}"</span> to confirm
             </p>
             <Input 
                className="bg-white/5 border-white/10 h-12 text-white rounded-xl text-center font-mono"
                placeholder="Enter ID here"
                value={deleteConfirmId}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
             />
          </div>

          <DialogFooter className="gap-2">
            <Button 
               variant="outline" 
               onClick={() => { 
                  setIsDeleteOpen(false); 
                  setPersonnelToDelete(null); 
                  setDeleteConfirmInput("");
               }} 
               className="rounded-xl border-white/10 text-white hover:bg-white/5"
            >
               Cancel
            </Button>
            <Button 
               onClick={handleDelete}
               disabled={isSubmitting || deleteConfirmId !== personnelToDelete?.empId}
               className="bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl px-8 disabled:opacity-30 disabled:cursor-not-allowed"
            >
               {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
