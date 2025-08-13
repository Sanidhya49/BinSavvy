
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm = ({ onToggleForm }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', { username, password });
    try {
      const success = await login(username, password);
      console.log('Login result:', success);
      if (success) {
        toast.success("Login successful!");
        console.log('Redirecting to dashboard...');
        // Navigate immediately after successful login
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Login failed. Please try again.");
    }
  };

  const loginAsAdmin = async () => {
    console.log('Login as Admin clicked');
    try {
      const success = await login("admin", "admin123");
      console.log('Admin login result:', success);
      if (success) {
        toast.success("Admin login successful!");
        console.log('Redirecting to admin...');
        // Navigate immediately after successful login
        navigate("/admin");
      } else {
        toast.error("Admin login failed.");
      }
    } catch (err) {
      console.error('Admin login error:', err);
      toast.error("Admin login failed. Please try again.");
    }
  };

  const loginAsUser = async () => {
    console.log('Login as User clicked');
    try {
      const success = await login("user", "user123");
      console.log('User login result:', success);
      if (success) {
        toast.success("User login successful!");
        console.log('Redirecting to dashboard...');
        // Navigate immediately after successful login
        navigate("/dashboard");
      } else {
        toast.error("User login failed.");
      }
    } catch (err) {
      console.error('User login error:', err);
      toast.error("User login failed. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-xl ring-1 ring-black/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-binsavvy-700 hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="pt-2 space-y-2">
            <div className="text-xs text-center text-muted-foreground tracking-wide uppercase">Quick login</div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={loginAsAdmin}
                disabled={loading}
              >
                Login as Admin
              </Button>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={loginAsUser}
                disabled={loading}
              >
                Login as User
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full button-gradient" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-binsavvy-600 hover:underline"
            >
              Create an account
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
