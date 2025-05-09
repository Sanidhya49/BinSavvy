
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout = ({ 
  children, 
  requireAdmin = false 
}: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to access this page");
      navigate("/auth");
    } else if (!loading && requireAdmin && user?.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
  }, [user, loading, navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen from useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 container py-6 md:py-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
