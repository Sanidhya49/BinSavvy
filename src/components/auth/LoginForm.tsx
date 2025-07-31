
import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login successful!");
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  const loginAsAdmin = async () => {
    try {
      await login("admin@binsavvy.com", "password");
      toast.success("Admin login successful!");
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  const loginAsUser = async () => {
    try {
      await login("user@binsavvy.com", "password");
      toast.success("User login successful!");
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login to BinSavvy</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-binsavvy-600 hover:underline">
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
            <div className="text-sm text-center text-muted-foreground">
              Quick Login Shortcuts
            </div>
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
          
          {/* Demo Instructions */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-blue-800 mb-2">Demo Instructions:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Backend Required:</strong> Start Django server first</li>
              <li>• <strong>Quick Login:</strong> Use "Login as Admin" or "Login as User" buttons</li>
              <li>• <strong>Manual Login:</strong> Try admin@binsavvy.com or user@binsavvy.com</li>
              <li>• <strong>Any Password:</strong> Password field can be anything for demo</li>
            </ul>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
