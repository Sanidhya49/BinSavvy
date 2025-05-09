
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/types/waste";
import { ArrowUpRight } from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUploads: 0,
    pendingUploads: 0,
    processedUploads: 0
  });
  const [recentUploads, setRecentUploads] = useState<ImageUpload[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchData = () => {
      try {
        // Get uploads from localStorage
        const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
        
        // Filter uploads for the current user
        const userUploads = allUploads.filter(upload => upload.userId === user?.id);
        
        // Calculate stats
        setStats({
          totalUploads: userUploads.length,
          pendingUploads: userUploads.filter(u => u.status === "pending").length,
          processedUploads: userUploads.filter(u => u.status === "processed").length
        });
        
        // Get recent uploads
        setRecentUploads(userUploads.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <Button asChild className="button-gradient">
          <Link to="/upload">Upload New Image</Link>
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Images contributed to waste analysis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Analysis</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUploads}</div>
            <p className="text-xs text-muted-foreground">
              Uploads awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processed Images</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedUploads}</div>
            <p className="text-xs text-muted-foreground">
              Successfully analyzed images
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Uploads */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Uploads</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history" className="flex items-center gap-1">
                  View all 
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Your most recent contributions to waste analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUploads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't uploaded any images yet.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/upload">Upload Your First Image</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="overflow-hidden rounded-md border">
                    <div className="aspect-video relative">
                      <img
                        src={upload.thumbnailUrl}
                        alt="Uploaded waste"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                        <p className="text-xs truncate">{upload.location.address || "No location"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Impact Section */}
      <div className="bg-gradient-to-br from-binsavvy-500/10 to-waste-600/10 rounded-lg p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Your Environmental Impact</h2>
          <p className="text-muted-foreground">
            By contributing image data, you're helping AI models identify waste more
            accurately, leading to better waste management solutions.
          </p>
          <Button asChild variant="outline">
            <Link to="/upload">Upload More Images</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
