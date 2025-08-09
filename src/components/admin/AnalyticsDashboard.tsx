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
import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { ImageUpload } from "@/lib/api";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart as RBarChart, Bar, ResponsiveContainer, PieChart as RPieChart, Pie, Legend, Cell } from "recharts";

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
  const [filteredUploads, setFilteredUploads] = useState<ImageUpload[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Prefer admin aggregate API if available
      const adminAgg = await apiClient.getAnalytics().catch((): { success: boolean } => ({ success: false }));

      if (adminAgg && adminAgg.success && adminAgg.data) {
        // Attempt to hydrate from backend aggregate; fallback to client calc if shape unexpected
        const data = adminAgg.data as Partial<AnalyticsData> & { uploads?: ImageUpload[] };
        if (data.uploads && Array.isArray(data.uploads)) {
          const scoped = filterByTimeRange(data.uploads, timeRange);
          const built = buildFromUploads(scoped);
          setAnalytics(built);
          setFilteredUploads(scoped);
        } else {
          // Use provided aggregates and empty recentActivity if not provided
          setAnalytics({
            totalUploads: data.totalUploads ?? 0,
            processingStats: data.processingStats ?? { pending: 0, processing: 0, completed: 0, failed: 0 },
            wasteTypes: data.wasteTypes ?? {},
            locations: data.locations ?? {},
            timeStats: data.timeStats ?? { averageProcessingTime: 0, totalProcessingTime: 0 },
            recentActivity: (data.recentActivity as ImageUpload[]) ?? [],
          });
          setFilteredUploads((data.recentActivity as ImageUpload[]) ?? []);
        }
      } else {
        // Fallback: fetch uploads and compute client-side
        const response = await apiClient.getUserImages();
        const allUploads = Array.isArray(response.data) ? response.data : (response.data as { data?: ImageUpload[] })?.data || [];
        const scoped = filterByTimeRange(allUploads, timeRange);
        const built = buildFromUploads(scoped);
        setAnalytics(built);
        setFilteredUploads(scoped);
      }
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    setExporting(true);
    try {
      const data = {
        analytics,
        timeRange,
        exportDate: new Date().toISOString(),
        generatedBy: 'BinSavvy Admin Analytics'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `binsavvy-admin-analytics-${timeRange}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // Derived datasets for charts
  const trendData = useMemo(() => buildTrendData(filteredUploads), [filteredUploads]);
  const statusBars = useMemo(() => ([
    { name: "Pending", value: analytics.processingStats.pending },
    { name: "Processing", value: analytics.processingStats.processing },
    { name: "Completed", value: analytics.processingStats.completed },
    { name: "Failed", value: analytics.processingStats.failed },
  ]), [analytics]);
  const wastePieData = useMemo(() => Object.entries(analytics.wasteTypes).map(([name, value]) => ({ name, value })), [analytics]);
  const pieColors = useMemo(
    () => [
      "#22c55e", // green-500
      "#3b82f6", // blue-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
      "#06b6d4", // cyan-500
      "#10b981", // emerald-500
      "#e11d48", // rose-600
      "#a3e635", // lime-400
      "#d946ef", // fuchsia-500
    ],
    []
  );

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

      {/* Trend + Status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uploads Over Time</CardTitle>
            <CardDescription>Daily uploads for the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <ChartContainer config={{ uploads: { label: "Uploads", color: "hsl(var(--primary))" } }}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-uploads)" fill="var(--color-uploads)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
            <CardDescription>Current processing pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ status: { label: "Count", color: "hsl(var(--muted-foreground))" } }}>
              <RBarChart data={statusBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </RBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Waste Types + Top Locations */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Tooltip />
                    <Legend />
                    <Pie data={wastePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                      {wastePieData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            )}
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
                  .slice(0, 6)
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
                        {(upload.analysis_results as { total_detections?: number })?.total_detections || 0} detections
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

// Helpers
function filterByTimeRange(uploads: ImageUpload[], range: string) {
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
  
  return uploads.filter(upload => new Date(upload.uploaded_at) >= cutoffDate);
}

function buildFromUploads(filteredUploads: ImageUpload[]): AnalyticsData {
  const processingStats = {
    pending: filteredUploads.filter(u => u.status === 'pending').length,
    processing: filteredUploads.filter(u => u.status === 'processing').length,
    completed: filteredUploads.filter(u => u.status === 'completed').length,
    failed: filteredUploads.filter(u => u.status === 'ml_failed' || u.status === 'failed').length
  };
  
  const wasteTypes: Record<string, number> = {};
  filteredUploads.forEach(upload => {
    const results = upload.analysis_results as { detections?: Array<{ class?: string }> } | undefined;
    if (results?.detections) {
      results.detections.forEach((detection: { class?: string }) => {
        const wasteType = detection.class || 'Unknown';
        wasteTypes[wasteType] = (wasteTypes[wasteType] || 0) + 1;
      });
    }
  });
  
  const locations: Record<string, number> = {};
  filteredUploads.forEach(upload => {
    if (upload.location) {
      locations[upload.location] = (locations[upload.location] || 0) + 1;
    }
  });
  
  const timeStats = {
    averageProcessingTime: 2.5,
    totalProcessingTime: filteredUploads.length * 2.5
  };
  
  return {
    totalUploads: filteredUploads.length,
    processingStats,
    wasteTypes,
    locations,
    timeStats,
    recentActivity: filteredUploads.slice(0, 5),
  };
}

function buildTrendData(uploads: ImageUpload[]) {
  const counts: Record<string, number> = {};
  for (const u of uploads) {
    const key = new Date(u.uploaded_at).toLocaleDateString();
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
} 