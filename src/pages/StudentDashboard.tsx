import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Clock, CheckCircle, XCircle, CreditCard, Loader2, RefreshCw, QrCode, Printer, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { QRCodeSVG } from "qrcode.react";

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

interface Payment {
  id: string;
  application_id: string;
  amount: number;
  payment_mode: string;
  transaction_id: string;
  payment_date: string;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  approved: { color: "bg-success/15 text-success border-success/30", icon: CheckCircle },
  rejected: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingApp, setPayingApp] = useState<Application | null>(null);
  const [payProcessing, setPayProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [viewPassApp, setViewPassApp] = useState<Application | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const passRef = useRef<HTMLDivElement>(null);

  const fetchApps = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bus_pass_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
    setLoading(false);
  };

  const fetchPayments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false });
    setPayments((data as Payment[]) || []);
  };

  useEffect(() => {
    fetchApps();
    fetchPayments();
  }, [user]);

  const handlePay = async () => {
    if (!payingApp || !user) return;
    setPayProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase
      .from("bus_pass_applications")
      .update({ payment_status: "paid" })
      .eq("id", payingApp.id);

    if (!error) {
      await supabase.from("payments").insert({
        application_id: payingApp.id,
        user_id: user.id,
        amount: 1500,
        payment_mode: "card",
        transaction_id: txnId,
      });
    }

    setPayProcessing(false);
    if (error) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment successful!", description: "Your bus pass has been paid." });
      setPayingApp(null);
      fetchApps();
      fetchPayments();
    }
  };

  const handleRenew = async (app: Application) => {
    if (!user) return;
    setRenewingId(app.id);
    const { error } = await supabase.from("bus_pass_applications").insert({
      user_id: user.id,
      student_name: app.student_name,
      college_name: app.college_name,
      department: app.department,
      year: app.year,
      route_from: app.route_from,
      route_to: app.route_to,
      status: "pending",
      payment_status: "unpaid",
    });
    setRenewingId(null);
    if (error) {
      toast({ title: "Renewal failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Renewal submitted", description: "A new application has been created." });
      fetchApps();
    }
  };

  const handlePrintPass = () => {
    if (!passRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Digital Bus Pass</title>
      <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5;}
      .pass{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:400px;width:100%;text-align:center;}
      .pass h2{margin:0 0 4px;}
      .pass p{margin:4px 0;color:#555;font-size:14px;}
      .pass .label{font-size:12px;color:#888;margin-top:12px;}
      .pass .value{font-size:16px;font-weight:600;}
      .qr{margin:16px auto;}
      </style></head><body>
      ${passRef.current.innerHTML}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
            <p className="mt-1 text-muted-foreground">Track your bus pass applications</p>
          </div>
          <Button onClick={() => navigate("/apply")} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> New Application
          </Button>
        </div>

        {/* Applications List */}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`gap-1 ${sc.color}`}>
                        <Icon className="h-3 w-3" />
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={app.payment_status === "paid" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>
                        {app.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                      {app.status === "approved" && app.payment_status !== "paid" && (
                        <Button size="sm" className="gradient-primary text-primary-foreground gap-1" onClick={() => setPayingApp(app)}>
                          <CreditCard className="h-3.5 w-3.5" /> Pay Now
                        </Button>
                      )}
                      {app.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={renewingId === app.id}
                          onClick={() => handleRenew(app)}
                        >
                          {renewingId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          Renew
                        </Button>
                      )}
                      {app.status === "approved" && app.payment_status === "paid" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setViewPassApp(app)}>
                          <QrCode className="h-3.5 w-3.5" /> View Pass
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Payment History */}
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-8 text-center text-muted-foreground">No payments recorded yet.</CardContent>
            </Card>
          ) : (
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                      <TableCell className="capitalize">{p.payment_mode}</TableCell>
                      <TableCell className="text-right font-semibold">₹{p.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        {/* Mock Payment Dialog */}
        <Dialog open={!!payingApp} onOpenChange={(open) => !open && setPayingApp(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Pay for Bus Pass
              </DialogTitle>
              <DialogDescription>
                Simulated payment for route: {payingApp?.route_from} → {payingApp?.route_to}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-2xl font-bold text-foreground">₹1,500</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">🔒 This is a simulated payment — no real charges</p>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handlePay} disabled={payProcessing}>
                {payProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : "Pay ₹1,500"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Digital Pass Dialog */}
        <Dialog open={!!viewPassApp} onOpenChange={(open) => !open && setViewPassApp(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> Digital Bus Pass
              </DialogTitle>
            </DialogHeader>
            {viewPassApp && (
              <div ref={passRef}>
                <div className="pass rounded-xl border border-border bg-card p-6 text-center space-y-4">
                  <div className="gradient-primary rounded-lg py-3 px-4">
                    <h2 className="text-lg font-bold text-primary-foreground">Smart Bus Pass</h2>
                    <p className="text-xs text-primary-foreground/80">Digital Transit Card</p>
                  </div>
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="label text-xs text-muted-foreground">Student Name</p>
                      <p className="value text-base font-semibold text-foreground">{viewPassApp.student_name}</p>
                    </div>
                    <div>
                      <p className="label text-xs text-muted-foreground">Route</p>
                      <p className="value text-base font-semibold text-foreground">{viewPassApp.route_from} → {viewPassApp.route_to}</p>
                    </div>
                    <div>
                      <p className="label text-xs text-muted-foreground">Application ID</p>
                      <p className="value font-mono text-xs text-foreground">{viewPassApp.id}</p>
                    </div>
                    <div>
                      <p className="label text-xs text-muted-foreground">Status</p>
                      <Badge className="bg-success/15 text-success border-success/30">Approved & Paid</Badge>
                    </div>
                  </div>
                  <div className="qr flex justify-center pt-2">
                    <QRCodeSVG
                      value={JSON.stringify({ applicationId: viewPassApp.id, userId: user?.id })}
                      size={160}
                      level="H"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Scan to verify pass authenticity</p>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full gap-2 mt-2" onClick={handlePrintPass}>
              <Printer className="h-4 w-4" /> Print Pass
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default StudentDashboard;
