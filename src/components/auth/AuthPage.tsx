
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-binsavvy-100 to-waste-100">
      <div className="container flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-4xl font-bold text-binsavvy-800 mb-2">BinSavvy</h1>
          <p className="text-lg text-muted-foreground">Smart Waste Analysis Platform</p>
        </div>
        
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
