import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ImageUpload } from "@/types/waste";

interface AnalyticsData {
  totalUploads: number;
  processingStats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  wasteTypes: Record<string, number>;
  locations: Record<string, number>;
  timeStats: {
    averageProcessingTime: number;
    totalProcessingTime: number;
  };
  recentActivity: ImageUpload[];
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUploads: 0,
    processingStats: { pending: 0, processing: 0, completed: 0, failed: 0 },
    wasteTypes: {},
    locations: {},
    timeStats: { averageProcessingTime: 0, totalProcessingTime: 0 },
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all images from backend
      const response = await apiClient.getUserImages();
      const allUploads = response.data || [];
      
      // Filter by time range
      const filteredUploads = filterByTimeRange(allUploads, timeRange);
      
      // Calculate processing statistics
      const processingStats = {
        pending: filteredUploads.filter(u => u.status === 'pending').length,
        processing: filteredUploads.filter(u => u.status === 'processing').length,
        completed: filteredUploads.filter(u => u.status === 'completed').length,
        failed: filteredUploads.filter(u => u.status === 'ml_failed' || u.status === 'failed').length
      };
      
      // Calculate waste types
      const wasteTypes: Record<string, number> = {};
      filteredUploads.forEach(upload => {
        if (upload.analysis_results && upload.analysis_results.detections) {
          upload.analysis_results.detections.forEach((detection: any) => {
            const wasteType = detection.class || 'Unknown';
            wasteTypes[wasteType] = (wasteTypes[wasteType] || 0) + 1;
          });
        }
      });
      
      // Calculate locations
      const locations: Record<string, number> = {};
      filteredUploads.forEach(upload => {
        if (upload.location) {
          locations[upload.location] = (locations[upload.location] || 0) + 1;
        }
      });
      
      // Calculate time statistics (mock data for now)
      const timeStats = {
        averageProcessingTime: 2.5, // seconds
        totalProcessingTime: filteredUploads.length * 2.5
      };
      
      setAnalytics({
        totalUploads: filteredUploads.length,
        processingStats,
        wasteTypes,
        locations,
        timeStats,
        recentActivity: filteredUploads.slice(0, 5)
      });
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (uploads: ImageUpload[], range: string) => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (range) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return uploads;
    }
    
    return uploads.filter(upload => {
      const uploadDate = new Date(upload.uploaded_at);
      return uploadDate >= cutoffDate;
    });
  };

  const exportAnalytics = async () => {
    setExporting(true);
    try {
      const data = {
        analytics,
        timeRange,
        exportDate: new Date().toISOString(),
        generatedBy: 'BinSavvy Analytics Dashboard'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `binsavvy-analytics-${timeRange}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getSuccessRate = () => {
    const total = analytics.processingStats.completed + analytics.processingStats.failed;
    return total > 0 ? Math.round((analytics.processingStats.completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into waste processing and analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Images uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSuccessRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Processing success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.timeStats.averageProcessingTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waste Types</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(analytics.wasteTypes).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
            <CardDescription>Current processing pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <Badge variant="secondary">{analytics.processingStats.pending}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Processing</span>
                </div>
                <Badge variant="secondary">{analytics.processingStats.processing}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <Badge variant="secondary">{analytics.processingStats.completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Failed</span>
                </div>
                <Badge variant="secondary">{analytics.processingStats.failed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Most active waste reporting areas</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.locations).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No location data available
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(analytics.locations)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{location}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Waste Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Types Distribution</CardTitle>
          <CardDescription>Most commonly detected waste types</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.wasteTypes).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No waste types detected yet
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(analytics.wasteTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="font-medium">{type}</span>
                    </div>
                    <Badge variant="outline">{count} detections</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest uploads and processing activity</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((upload) => (
                <div key={upload.image_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={upload.image_url} 
                      alt="Upload"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">{upload.location || 'No location'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(upload.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={upload.status} />
                    {upload.analysis_results && (
                      <Badge variant="outline" className="text-xs">
                        {upload.analysis_results.total_detections || 0} detections
                      </Badge>
                    )}
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

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "ml_failed":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
  }
};

export default AnalyticsDashboard; 