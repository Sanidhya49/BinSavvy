
import { useEffect, useState } from "react";
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
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  console.log('DashboardLayout render:', { user, loading, isAuthenticated, requireAdmin, authChecked });

  useEffect(() => {
    console.log('DashboardLayout useEffect:', { user, loading, isAuthenticated, requireAdmin });
    
    // Only check authentication if not loading and not already checked
    if (!loading && !authChecked) {
      setAuthChecked(true);
      
      if (!isAuthenticated) {
        console.log('No authentication, redirecting to login');
        toast.error("Please login to access this page");
        navigate("/auth");
        return;
      }
      
      if (requireAdmin && user?.role !== "admin") {
        console.log('Not admin, redirecting to dashboard');
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }
      
      console.log('Authentication check passed, rendering dashboard');
    }
  }, [user, loading, isAuthenticated, navigate, requireAdmin, authChecked]);

  // Show loading spinner
  if (loading) {
    console.log('DashboardLayout: Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin (redirects will happen)
  if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
    console.log('DashboardLayout: Not authenticated or not admin, showing redirect');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!isAuthenticated ? "Redirecting to login..." : "Redirecting to dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // Render the dashboard content
  console.log('DashboardLayout: Rendering dashboard content');
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      <Navbar />
      <div className="flex-1 container py-4 md:py-6 lg:py-8 px-4 md:px-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
