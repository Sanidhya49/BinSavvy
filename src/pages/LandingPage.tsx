
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Github, Linkedin, Upload, BarChart3, Users, Globe, ArrowRight, CheckCircle, TrendingUp, Activity, MapPin } from "lucide-react";

// Updated landing page with enhanced UI and public reports section
const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="py-4 px-6 md:px-10 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-binsavvy-500 to-waste-600 w-8 h-8 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">BS</span>
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
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link to="/auth">Login</Link>
              </Button>
              <Button className="button-gradient" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-20">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              AI-Powered Waste Detection
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Smart Waste{" "}
              <span className="bg-gradient-to-r from-binsavvy-600 to-waste-600 bg-clip-text text-transparent">
                Analysis
              </span>{" "}
              Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Join our community effort to build a cleaner world. Upload waste images, get instant AI analysis, and help identify waste-prone areas for better environmental management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="button-gradient group">
                <Link to="/auth">
                  Start Contributing
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group">
                <Link to="#public-reports">
                  View Public Reports
                  <BarChart3 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Instant AI Analysis
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Community Driven
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Free to Use
              </div>
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
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-binsavvy-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-binsavvy-600" />
              </div>
              <h3 className="text-xl font-medium">Upload Images</h3>
              <p className="text-muted-foreground">
                Capture and upload photos of waste in your surroundings with location information.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-waste-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-waste-600" />
              </div>
              <h3 className="text-xl font-medium">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our machine learning models analyze the images to identify and categorize waste objects.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-binsavvy-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-binsavvy-600" />
              </div>
              <h3 className="text-xl font-medium">Community Impact</h3>
              <p className="text-muted-foreground">
                Contribute to environmental research and help develop better waste management solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Reports Section */}
      <section id="public-reports" className="py-16 px-6 bg-gradient-to-br from-binsavvy-500 to-waste-600 text-white">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Public Reports & Insights</h2>
            <p className="text-xl opacity-90">
              Explore our community-driven waste analysis reports and environmental insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Global Waste Trends</h3>
              <p className="opacity-90">
                Discover patterns in waste distribution across different regions and communities. Track seasonal variations and identify high-impact areas.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm opacity-75">Updated weekly</span>
                <div className="flex items-center gap-1 text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+15% this month</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">AI Detection Stats</h3>
              <p className="opacity-90">
                View statistics on waste detection accuracy and model performance metrics. Monitor real-time detection rates and confidence scores.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm opacity-75">Real-time data</span>
                <div className="flex items-center gap-1 text-blue-300">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">94.2% accuracy</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Community Impact</h3>
              <p className="opacity-90">
                See how our community contributions are making a difference in environmental research. Track user engagement and contribution milestones.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm opacity-75">Monthly reports</span>
                <div className="flex items-center gap-1 text-purple-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">1,247 locations</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8">
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-white/90 text-binsavvy-700">
              <Link to="/auth">Start Contributing Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-binsavvy-500 to-waste-600 w-8 h-8 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BS</span>
                </div>
                <span className="font-bold text-lg">BinSavvy</span>
              </div>
              <p className="text-gray-300 text-sm">
                Smart waste analysis platform powered by AI and community contributions.
              </p>
            </div>
            
            {/* Platform Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/auth" className="hover:text-white transition-colors">Upload Images</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">View History</Link></li>
                <li><Link to="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="#public-reports" className="hover:text-white transition-colors">Public Reports</Link></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/auth" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="#how-it-works" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            {/* Connect Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Connect</h3>
              <p className="text-gray-300 text-sm">
                Join our community of environmental researchers and activists.
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="mailto:sanidhyapatel49@gmail.com" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="Email us"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a 
                  href="https://github.com/Sanidhya49/BinSavvy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 BinSavvy. All rights reserved. Building a cleaner world together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
