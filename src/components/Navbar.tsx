import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Bus, LogOut, Sun, Moon, LayoutDashboard, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user, role, fullName, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) return null;

  const isAdmin = role === "admin";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <Bus className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            SmartBus
          </span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin ? (
            <Button
              variant={location.pathname === "/admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-1.5"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          ) : (
            <>
              <Button
                variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button
                variant={location.pathname === "/apply" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/apply")}
                className="gap-1.5"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Apply</span>
              </Button>
            </>
          )}

          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="h-9 w-9">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {(fullName || "U").charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
              {fullName || "User"}
            </span>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
