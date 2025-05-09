
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="py-4 px-6 md:px-10 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-binsavvy-500 to-waste-600 w-8 h-8 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">BS</span>
          </div>
          <span className="font-bold text-xl">BinSavvy</span>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild className="button-gradient">
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button className="button-gradient" asChild>
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-20">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Smart Waste Analysis Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Help us build a cleaner world by contributing to our waste detection and analysis system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="button-gradient">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-gradient-to-br from-binsavvy-500/10 to-waste-600/10 flex items-center justify-center p-10">
          <div className="relative max-w-md aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-binsavvy-500/20 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 bg-waste-600/20 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-binsavvy-500/30 rounded-full flex items-center justify-center">
                <span className="text-5xl font-bold text-binsavvy-700">BinSavvy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Join our community effort to analyze and combat waste
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-binsavvy-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-8 w-8 text-binsavvy-600"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">Upload Images</h3>
              <p className="text-muted-foreground">
                Capture and upload photos of waste in your surroundings with location information.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-waste-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-8 w-8 text-waste-600"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our machine learning models analyze the images to identify and categorize waste objects.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-binsavvy-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-8 w-8 text-binsavvy-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">Insights & Actions</h3>
              <p className="text-muted-foreground">
                Get insights on waste composition and contribute to targeted cleanup initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-gradient-to-br from-binsavvy-500 to-waste-600 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Join Our Waste Analysis Community</h2>
          <p className="text-xl">
            Help us build a comprehensive database of waste information to develop better waste management solutions.
          </p>
          <Button asChild size="lg" variant="outline" className="bg-white hover:bg-white/90 text-binsavvy-700">
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-binsavvy-500 to-waste-600 w-8 h-8 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">BS</span>
              </div>
              <span className="font-bold">BinSavvy</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BinSavvy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
