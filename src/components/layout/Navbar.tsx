
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);
  const navClass = (to: string) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive(to) ? "text-foreground" : "text-muted-foreground"
    );

  // Get user initials safely
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/binsavvy_logo.png" alt="BinSavvy" className="h-10 w-10 object-contain transition-transform group-hover:scale-[1.03]" />
            <div className="hidden md:block">
              <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">BinSavvy</span>
              <p className="text-xs text-muted-foreground">Smart Waste Analysis</p>
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex mx-6 flex-1 items-center space-x-4 lg:space-x-6">
          {user?.role === "admin" ? (
            <>
              <Link to="/admin" className={navClass("/admin")}> 
                Dashboard
              </Link>
              <Link to="/admin/uploads" className={navClass("/admin/uploads")}>
                User Uploads
              </Link>
              <Link to="/admin/analytics" className={navClass("/admin/analytics")}>
                Analytics
              </Link>
              <Link to="/admin/ml-processor" className={navClass("/admin/ml-processor")}>
                ML Processor
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={navClass("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/upload" className={navClass("/upload")}>
                Upload
              </Link>
              <Link to="/history" className={navClass("/history")}>
                History
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg ring-2 ring-green-300/30 hover:ring-green-300/50 transition-all">
                    <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={logout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          )}
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-6 px-6 bg-gradient-to-br from-green-50/60 via-emerald-50/40 to-blue-50/60">
          <nav className="flex flex-col space-y-4">
            {user?.role === "admin" ? (
              <>
                <Link 
                  to="/admin" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/admin") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/uploads" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/admin/uploads") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  User Uploads
                </Link>
                <Link 
                  to="/admin/analytics" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/admin/analytics") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link 
                  to="/admin/ml-processor" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/admin/ml-processor") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ML Processor
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/dashboard") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/upload") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link 
                  to="/history" 
                  className={cn("text-sm font-medium py-4 px-6 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all shadow-sm", isActive("/history") && "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  History
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
