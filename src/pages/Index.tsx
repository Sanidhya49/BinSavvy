
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import { 
  Upload, 
  BarChart3, 
  Shield, 
  Globe, 
  Users, 
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Camera,
  MapPin,
  TrendingUp,
  Activity,
  Mail,
  Github,
  Linkedin
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Landing header scroll effect
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      if (!headerRef.current) return;
      headerRef.current.classList.toggle("scrolled", scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Scroll-reveal base styles */}
      <style>{`
        .reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .landing-header{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,.6);backdrop-filter:saturate(180%) blur(10px);transition:background .25s ease, box-shadow .25s ease, border-color .25s ease}
        .landing-header.scrolled{background:rgba(255,255,255,.92);box-shadow:0 10px 30px rgba(2,6,23,.06);border-color:rgba(2,6,23,.06)}
      `}</style>
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>
      {/* Header */}
      <header ref={headerRef} className="landing-header py-3 md:py-4 px-4 md:px-10 flex items-center justify-between border-b border-transparent">
        <div className="flex items-center gap-2">
          <img src="/binsavvy_logo.png" alt="BinSavvy" className="h-8 md:h-10 w-auto" />
          <span className="font-bold text-lg md:text-xl text-gray-900">BinSavvy</span>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        {/* decorative gradient underline */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-green-400/50 via-emerald-400/40 to-blue-400/50" />
      </header>
      {/* spacer for fixed header height */}
      <div className="h-14 md:h-16" />

      {/* Hero Section */}
      <section className="relative px-4 md:px-10 reveal min-h-[calc(100vh-4rem)] flex items-center py-4 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto w-full lg:-translate-y-2 xl:-translate-y-3 transition-transform">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  AI-Powered Waste Detection
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Smart Waste
                  <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Analysis Platform
                  </span>
                </h1>
                <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                  Join our community effort to build a cleaner world. Upload waste images, 
                  get instant AI analysis, and help identify waste-prone areas for better 
                  environmental management.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-sm hover:shadow w-full sm:w-auto">
                  <Link to="/auth">
                    Start Contributing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 hover:shadow w-full sm:w-auto">
                  <Link to="#public-reports">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Public Reports
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant AI Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Community Driven</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to Use</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-3 sm:p-6 border overflow-hidden flex items-center justify-center ring-1 ring-black/5">
                <img src="/binsavvy_logo.png" alt="Waste Detection" className="w-full h-auto max-w-[260px] sm:max-w-[320px] md:max-w-[400px] object-contain transform -scale-x-100 mx-auto" />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 md:px-10 bg-white reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Why Choose BinSavvy?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with community-driven 
              environmental action to create a sustainable future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 md:p-8 border border-green-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Upload</h3>
              <p className="text-gray-600">
                Simply upload photos of waste areas using your camera or device. 
                Our platform supports multiple image formats and sizes.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 md:p-8 border border-blue-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Advanced machine learning models instantly analyze your images 
                to identify and categorize waste objects with high accuracy.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 md:p-8 border border-emerald-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Impact</h3>
              <p className="text-gray-600">
                Contribute to environmental research and help develop better 
                waste management solutions for communities worldwide.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 md:p-8 border border-purple-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security. 
                We only use anonymized data for research purposes.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 md:p-8 border border-orange-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Driven</h3>
              <p className="text-gray-600">
                Join thousands of users contributing to environmental research. 
                Every upload helps build a cleaner, more sustainable world.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 md:p-8 border border-teal-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-6">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Results</h3>
              <p className="text-gray-600">
                View your contribution to environmental research and see 
                how your data helps improve waste management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Reports Section */}
      <section id="public-reports" className="py-16 md:py-20 px-4 md:px-10 bg-gradient-to-r from-green-600 to-blue-600 text-white reveal">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Public Reports & Insights</h2>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
              Explore our community-driven waste analysis reports and environmental insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 space-y-4 hover:bg-white/15 transition-colors">
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
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 space-y-4 hover:bg-white/15 transition-colors">
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
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 space-y-4 hover:bg-white/15 transition-colors">
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
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-white/90 text-green-700 text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
              <Link to="/auth">Start Contributing Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-10 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 w-8 h-8 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">BS</span>
                </div>
                <span className="font-bold text-xl">BinSavvy</span>
              </div>
              <p className="text-gray-400">
                Smart waste analysis platform powered by AI and community contributions.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth" className="hover:text-white transition-colors">Upload Images</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">View History</Link></li>
                <li><Link to="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="#public-reports" className="hover:text-white transition-colors">Public Reports</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="#how-it-works" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Connect</h3>
              <p className="text-gray-400">
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
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BinSavvy. All rights reserved. Building a cleaner world together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
