import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, FileText, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Application {
  id: string;
  student_name: string;
  college_name: string;
  department: string;
  year: string;
  route_from: string;
  route_to: string;
  status: string;
  payment_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase
      .from("bus_pass_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("bus_pass_applications")
      .update({ status })
      .eq("id", id);
    setUpdating(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Application ${status}.` });
      fetchAll();
    }
  };

  const total = applications.length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "Total", value: total, icon: FileText, color: "text-primary" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-success" },
    { label: "Pending", value: pending, icon: Clock, color: "text-warning" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage all bus pass applications</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              All Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No applications found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">College</TableHead>
                      <TableHead className="hidden lg:table-cell">Dept</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.student_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{app.college_name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{app.department}</TableCell>
                        <TableCell className="text-sm">
                          {app.route_from} → {app.route_to}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              app.status === "approved"
                                ? "bg-success/15 text-success border-success/30"
                                : app.status === "rejected"
                                ? "bg-destructive/15 text-destructive border-destructive/30"
                                : "bg-warning/15 text-warning border-warning/30"
                            }
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {app.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1 text-success hover:bg-success/10"
                                onClick={() => updateStatus(app.id, "approved")}
                                disabled={updating === app.id}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                            )}
                            {app.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1 text-destructive hover:bg-destructive/10"
                                onClick={() => updateStatus(app.id, "rejected")}
                                disabled={updating === app.id}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Reject</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
