
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">
          BinSavvy: Smart Waste Analysis Platform
        </h1>
        <p className="text-xl text-gray-600">
          Help us build a cleaner world by contributing to our waste detection and analysis system.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild size="lg">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Test Links: 
            <Link to="/test-page" className="ml-2 text-blue-600 hover:underline">Test Page</Link> | 
            <Link to="/debug" className="ml-2 text-blue-600 hover:underline">Debug</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
