"use client";

import { useEffect, useState } from "react";
import { rosterApi } from "@/lib/api";
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
  
  // Edit state
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchEmployees = async () => {
    try {
      const response = await rosterApi.getEmployees();
      setEmployees(response.data);
    } catch (err) {
      toast.error("Failed to fetch personnel data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const roles = Array.from(new Set(employees.map(e => e.role)));

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());
    const matchesCrew = crewFilter === "all" || emp.crew === crewFilter;
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesSearch && matchesCrew && matchesRole;
  });

  const handleDelete = async (empId: string) => {
    if (!window.confirm("Are you sure you want to remove this personnel?")) return;
    try {
      await rosterApi.deleteEmployee(empId);
      setEmployees(employees.filter(e => e.empId !== empId));
      toast.success("Personnel removed");
    } catch (err) {
      toast.error("Failed to remove personnel");
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary h-6 w-6" />
            Personnel Management
          </h1>
          <p className="text-muted-foreground text-sm">Oversee and manage operational staff roster.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Select value={crewFilter} onValueChange={setCrewFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Crews" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crews</SelectItem>
                {['A', 'B', 'C', 'D', 'S'].map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search personnel..." 
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {user?.role === 'admin' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Personnel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Personnel</DialogTitle>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newEmp = {
                    name: formData.get("name") as string,
                    empId: formData.get("empId") as string,
                    crew: formData.get("crew") as string,
                    role: formData.get("role") as string,
                    leaves: []
                  };
                  try {
                    await rosterApi.createEmployee(newEmp);
                    setEmployees([...employees, newEmp]);
                    toast.success("Personnel added");
                  } catch (err) {
                    toast.error("Failed to add personnel");
                  }
                }} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employee ID</Label>
                    <Input name="empId" placeholder="EMP001" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Crew</Label>
                      <Select name="crew" defaultValue="A">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'S'].map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <Input name="role" placeholder="Operator" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Save Personnel</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Simple Stats Grid (System Status Removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Staff</p>
          <p className="text-2xl font-bold">{employees.length}</p>
        </Card>
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Active Crews</p>
          <p className="text-2xl font-bold">5</p>
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
                          onClick={() => handleDelete(emp.empId)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Personnel</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input 
                  value={editingEmployee.name} 
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label>Employee ID (Read-only)</Label>
                <Input value={editingEmployee.empId} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Crew</Label>
                  <Select 
                    value={editingEmployee.crew} 
                    onValueChange={(val) => setEditingEmployee({...editingEmployee, crew: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'S'].map(c => <SelectItem key={c} value={c}>Crew {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input 
                    value={editingEmployee.role} 
                    onChange={(e) => setEditingEmployee({...editingEmployee, role: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
