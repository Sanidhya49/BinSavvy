
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
          <Link to="/" className="flex items-center space-x-2 group">
            <img src="/binsavvy_logo.png" alt="BinSavvy" className="h-8 w-auto transition-transform group-hover:scale-[1.03]" />
            <span className="font-bold text-xl hidden md:block">BinSavvy</span>
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
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <div className="bg-binsavvy-200 text-binsavvy-700 rounded-full w-9 h-9 flex items-center justify-center">
                    {getUserInitials()}
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
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background">
          <nav className="flex flex-col space-y-3">
            {user?.role === "admin" ? (
              <>
                <Link 
                  to="/admin" 
                  className={cn("text-sm font-medium py-2 px-1 rounded-md hover:bg-accent", isActive("/admin") && "text-foreground")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/uploads" 
                  className={cn("text-sm font-medium py-2 px-1 rounded-md hover:bg-accent", isActive("/admin/uploads") && "text-foreground")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  User Uploads
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={cn("text-sm font-medium py-2 px-1 rounded-md hover:bg-accent", isActive("/dashboard") && "text-foreground")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  className={cn("text-sm font-medium py-2 px-1 rounded-md hover:bg-accent", isActive("/upload") && "text-foreground")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link 
                  to="/history" 
                  className={cn("text-sm font-medium py-2 px-1 rounded-md hover:bg-accent", isActive("/history") && "text-foreground")}
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
