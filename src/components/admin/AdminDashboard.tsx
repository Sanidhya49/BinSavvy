
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/types/waste";
import { apiClient } from "@/lib/api";
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Settings,
  Activity,
  Database,
  Cpu,
  Wifi,
  Server
} from "lucide-react";

interface SystemHealth {
  backend: boolean;
  ml_service: boolean;
  cloudinary: boolean;
  roboflow: boolean;
}

interface AdminStats {
  totalUploads: number;
  pendingAnalysis: number;
  processedImages: number;
  failedUploads: number;
  averageProcessingTime: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUploads: 0,
    pendingAnalysis: 0,
    processedImages: 0,
    failedUploads: 0,
    averageProcessingTime: 0
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    backend: false,
    ml_service: false,
    cloudinary: false,
    roboflow: false
  });
  
  const [recentUploads, setRecentUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch all images from backend
        const response = await apiClient.getUserImages();
        const allUploads = response.data || [];
        
        // Calculate stats
        const totalUploads = allUploads.length;
        const pendingAnalysis = allUploads.filter(u => u.status === "processing").length;
        const processedImages = allUploads.filter(u => u.status === "completed").length;
        const failedUploads = allUploads.filter(u => u.status === "ml_failed" || u.status === "failed").length;
        
        // Calculate average processing time (mock data for now)
        const averageProcessingTime = 2.5; // seconds
        
        setStats({
          totalUploads,
          pendingAnalysis,
          processedImages,
          failedUploads,
          averageProcessingTime
        });
        
        // Get recent uploads (last 4)
        setRecentUploads(allUploads.slice(0, 4));
        
        // Check system health
        await checkSystemHealth();
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Check backend health
      await apiClient.checkUserServiceHealth();
      setSystemHealth(prev => ({ ...prev, backend: true }));
    } catch (error) {
      setSystemHealth(prev => ({ ...prev, backend: false }));
    }
    
    // For now, assume other services are working
    // In a real app, you'd check each service individually
    setSystemHealth(prev => ({
      ...prev,
      ml_service: true,
      cloudinary: true,
      roboflow: true
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'ml_failed': return 'bg-red-100 text-red-800';
      case 'ml_unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatus = () => {
    const healthyServices = Object.values(systemHealth).filter(Boolean).length;
    const totalServices = Object.keys(systemHealth).length;
    return (healthyServices / totalServices) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          System Settings
        </Button>
      </div>
      
      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Overall system status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-sm text-muted-foreground">{getHealthStatus().toFixed(0)}%</span>
            </div>
            <Progress value={getHealthStatus()} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Server className={`h-4 w-4 ${systemHealth.backend ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Backend</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className={`h-4 w-4 ${systemHealth.ml_service ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">ML Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className={`h-4 w-4 ${systemHealth.cloudinary ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Cloudinary</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className={`h-4 w-4 ${systemHealth.roboflow ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">Roboflow</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Total images uploaded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAnalysis}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedImages}</div>
            <p className="text-xs text-muted-foreground">
              Successfully analyzed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedUploads}</div>
            <p className="text-xs text-muted-foreground">
              Processing errors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}s</div>
            <p className="text-xs text-muted-foreground">
              Processing time
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key platform functions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-md p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium">Manage Uploads</h3>
              <p className="text-xs text-muted-foreground">
                View and process all uploads
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/admin/uploads">Go to Uploads</Link>
            </Button>
          </div>
          
          <div className="border rounded-md p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Insights and reporting data
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/analytics">View Analytics</Link>
            </Button>
          </div>
          
          <div className="border rounded-md p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium">ML Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Configure models and thresholds
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/settings">Configure</Link>
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
                <div key={upload.image_id} className="overflow-hidden rounded-md border">
                  <div className="aspect-square relative">
                    <img
                      src={upload.image_url}
                      alt="Uploaded waste"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <Badge className={`text-[10px] mb-1 ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </Badge>
                      <p className="text-xs text-white truncate">
                        {upload.location || "No location"}
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
