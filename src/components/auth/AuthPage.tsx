
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-binsavvy-100 to-waste-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="outline" asChild className="bg-white/80 backdrop-blur-sm hover:bg-white">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="container flex flex-col items-center justify-center flex-1 px-4 py-12">
        {/* Title */}
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-4xl font-bold text-binsavvy-800 mb-2">BinSavvy</h1>
          <p className="text-lg text-muted-foreground">Smart Waste Analysis Platform</p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
