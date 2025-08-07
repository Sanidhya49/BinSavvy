import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ImageUpload } from "@/types/waste";
import { Link } from "react-router-dom";

interface WasteAnalytics {
  totalImages: number;
  wasteTypes: Record<string, number>;
  locations: Record<string, number>;
  processingSuccess: number;
  averageConfidence: number;
  topWasteTypes: Array<{ type: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState<WasteAnalytics>({
    totalImages: 0,
    wasteTypes: {},
    locations: {},
    processingSuccess: 0,
    averageConfidence: 0,
    topWasteTypes: [],
    topLocations: []
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('AnalyticsPanel: Starting to fetch analytics...');
      
      // Fetch all images from backend
      const response = await apiClient.getUserImages();
      console.log('AnalyticsPanel: API response:', response);
      
      const allUploads = response.data || [];
      console.log('AnalyticsPanel: All uploads:', allUploads);
      
      // Filter by time range
      const filteredUploads = filterByTimeRange(allUploads, timeRange);
      console.log('AnalyticsPanel: Filtered uploads:', filteredUploads);
      
      // Calculate analytics
      const wasteTypes: Record<string, number> = {};
      const locations: Record<string, number> = {};
      let totalConfidence = 0;
      let confidenceCount = 0;
      let successCount = 0;
      
      filteredUploads.forEach(upload => {
        // Count locations
        if (upload.location) {
          locations[upload.location] = (locations[upload.location] || 0) + 1;
        }
        
        // Count successful processing
        if (upload.status === 'completed') {
          successCount++;
        }
        
        // Analyze waste types from ML results
        if (upload.analysis_results && upload.analysis_results.detections) {
          upload.analysis_results.detections.forEach((detection: any) => {
            const wasteType = detection.class || 'Unknown';
            wasteTypes[wasteType] = (wasteTypes[wasteType] || 0) + 1;
            
            if (detection.confidence) {
              totalConfidence += detection.confidence;
              confidenceCount++;
            }
          });
        }
      });
      
      console.log('AnalyticsPanel: Calculated analytics:', {
        wasteTypes,
        locations,
        successCount,
        confidenceCount
      });
      
      // Calculate top waste types and locations
      const topWasteTypes = Object.entries(wasteTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      const topLocations = Object.entries(locations)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const analyticsData = {
        totalImages: filteredUploads.length,
        wasteTypes,
        locations,
        processingSuccess: successCount,
        averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        topWasteTypes,
        topLocations
      };
      
      console.log('AnalyticsPanel: Setting analytics data:', analyticsData);
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error("AnalyticsPanel: Error fetching analytics:", error);
      // Set default analytics if there's an error
      setAnalytics({
        totalImages: 0,
        wasteTypes: {},
        locations: {},
        processingSuccess: 0,
        averageConfidence: 0,
        topWasteTypes: [],
        topLocations: []
      });
    } finally {
      console.log('AnalyticsPanel: Setting loading to false');
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

  const exportAnalytics = () => {
    const data = {
      analytics,
      timeRange,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Check if we have any data
  if (analytics.totalImages === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Waste Analytics</h1>
            <p className="text-muted-foreground">Insights and trends from waste analysis</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Data Available</h3>
                <p className="text-muted-foreground">
                  No waste images have been uploaded yet. Upload some images to see analytics.
                </p>
              </div>
              <Button asChild>
                <Link to="/upload">Upload First Image</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Waste Analytics</h1>
          <p className="text-muted-foreground">Insights and trends from waste analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Time Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: '24h', label: '24 Hours' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: 'all', label: 'All Time' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={timeRange === value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Images analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalImages > 0 
                ? Math.round((analytics.processingSuccess / analytics.totalImages) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Processing success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.averageConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              ML model confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waste Types</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(analytics.wasteTypes).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Waste Types */}
      <Card>
        <CardHeader>
          <CardTitle>Top Waste Types</CardTitle>
          <CardDescription>Most commonly detected waste types</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topWasteTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No waste types detected yet
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topWasteTypes.map(({ type, count }) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{type}</Badge>
                  </div>
                  <div className="text-sm font-medium">{count} detections</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
          <CardDescription>Most active waste reporting areas</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topLocations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No location data available
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topLocations.map(({ location, count }) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{location}</span>
                  </div>
                  <div className="text-sm font-medium">{count} reports</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Processing Timeline
          </CardTitle>
          <CardDescription>Recent processing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Timeline chart coming soon...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This will show processing activity over time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel; 