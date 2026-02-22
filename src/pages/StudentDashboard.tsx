import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
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

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  approved: { color: "bg-success/15 text-success border-success/30", icon: CheckCircle },
  rejected: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchApps = async () => {
      const { data } = await supabase
        .from("bus_pass_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setApplications((data as Application[]) || []);
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
            <p className="mt-1 text-muted-foreground">Track your bus pass applications</p>
          </div>
          <Button onClick={() => navigate("/apply")} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> New Application
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-16">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Apply for your first bus pass to get started</p>
              <Button onClick={() => navigate("/apply")} className="mt-4 gradient-primary text-primary-foreground">
                Apply Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => {
              const sc = statusConfig[app.status] || statusConfig.pending;
              const Icon = sc.icon;
              return (
                <Card key={app.id} className="glass-card transition-all hover:shadow-xl">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{app.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.college_name} · {app.department} · Year {app.year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🚌 {app.route_from} → {app.route_to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`gap-1 ${sc.color}`}>
                        <Icon className="h-3 w-3" />
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={app.payment_status === "paid" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>
                        {app.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
