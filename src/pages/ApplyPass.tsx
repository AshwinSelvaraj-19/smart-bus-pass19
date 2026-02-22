import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ApplyPass = () => {
  const { user, fullName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    student_name: fullName || "",
    college_name: "",
    department: "",
    year: "",
    route_from: "",
    route_to: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    );

    if (Object.values(trimmed).some((v) => !v)) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("bus_pass_applications").insert([{
      user_id: user.id,
      student_name: trimmed.student_name,
      college_name: trimmed.college_name,
      department: trimmed.department,
      year: trimmed.year,
      route_from: trimmed.route_from,
      route_to: trimmed.route_to,
    }]);

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Application Submitted!", description: "Your bus pass application is under review." });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Application Submitted!</h2>
          <p className="mt-2 text-muted-foreground">Your bus pass application has been submitted and is pending review.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-6 gradient-primary text-primary-foreground">
            Back to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Apply for Bus Pass</CardTitle>
            <CardDescription>Fill in your details to apply for a new bus pass</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student_name">Student Name</Label>
                  <Input
                    id="student_name"
                    value={form.student_name}
                    onChange={(e) => updateField("student_name", e.target.value)}
                    placeholder="Your full name"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college_name">College Name</Label>
                  <Input
                    id="college_name"
                    value={form.college_name}
                    onChange={(e) => updateField("college_name", e.target.value)}
                    placeholder="e.g. MIT"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="e.g. Computer Science"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={form.year} onValueChange={(v) => updateField("year", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route_from">Route From</Label>
                  <Input
                    id="route_from"
                    value={form.route_from}
                    onChange={(e) => updateField("route_from", e.target.value)}
                    placeholder="Starting point"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route_to">Route To</Label>
                  <Input
                    id="route_to"
                    value={form.route_to}
                    onChange={(e) => updateField("route_to", e.target.value)}
                    placeholder="Destination"
                    required
                    maxLength={200}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplyPass;
