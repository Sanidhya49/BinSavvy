
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/types/waste";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUploads: 0,
    pendingAnalysis: 0,
    processedImages: 0
  });
  
  const [recentUploads, setRecentUploads] = useState<ImageUpload[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchData = () => {
      try {
        // Get all uploads from localStorage
        const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
        
        // Calculate stats
        setStats({
          totalUploads: allUploads.length,
          pendingAnalysis: allUploads.filter(u => u.status === "pending").length,
          processedImages: allUploads.filter(u => u.status === "processed").length
        });
        
        // Get recent uploads
        setRecentUploads(allUploads.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Total images uploaded by users
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAnalysis}</div>
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedImages}</div>
            <p className="text-xs text-muted-foreground">
              Successfully analyzed images
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key platform functions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="border rounded-md p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-binsavvy-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6 text-binsavvy-600"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium">Process Uploads</h3>
              <p className="text-xs text-muted-foreground">
                Analyze pending waste images
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/admin/uploads">Go to Uploads</Link>
            </Button>
          </div>
          <div className="border rounded-md p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-waste-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6 text-waste-600"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium">Run Analysis Models</h3>
              <p className="text-xs text-muted-foreground">
                Apply ML models to waste imagery
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/analysis">Start Analysis</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Latest user contributions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/uploads">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentUploads.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No uploads available</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="overflow-hidden rounded-md border">
                  <div className="aspect-square relative">
                    <img
                      src={upload.thumbnailUrl}
                      alt="Uploaded waste"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="px-1 py-0.5 text-[10px] rounded-sm bg-white/90 text-black inline-block mb-1">
                        {upload.status}
                      </div>
                      <p className="text-xs text-white truncate">
                        {upload.location.address || "No location"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
