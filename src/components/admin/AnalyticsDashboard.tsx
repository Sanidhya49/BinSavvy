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
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart as RBarChart, Bar } from "recharts";

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
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx' | 'docx' | 'txt'>('json');
  const [zoneSizeMeters, setZoneSizeMeters] = useState<number>(500);
  const [includeAddresses, setIncludeAddresses] = useState<boolean>(true);
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
      // Build clustered zones report suitable for municipal action
      const zones = await buildZonesReport(filteredUploads, zoneSizeMeters, includeAddresses);

      const report = {
        meta: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'BinSavvy Admin Analytics',
          timeRange,
          zoneSizeMeters,
          includeAddresses,
          totals: {
            uploads: analytics.totalUploads,
            zones: zones.length,
            completed: analytics.processingStats.completed,
            failed: analytics.processingStats.failed,
          },
        },
        zones,
      };

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        saveBlob(blob, `binsavvy-zones-report-${timeRange}-${zoneSizeMeters}m.json`);
      } else if (exportFormat === 'csv') {
        const csv = buildZonesCSV(report);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveBlob(blob, `binsavvy-zones-report-${timeRange}-${zoneSizeMeters}m.csv`);
      } else if (exportFormat === 'txt') {
        const txt = buildZonesTXT(report);
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        saveBlob(blob, `binsavvy-zones-report-${timeRange}-${zoneSizeMeters}m.txt`);
      } else if (exportFormat === 'xlsx') {
        await exportZonesXLSX(report, `binsavvy-zones-report-${timeRange}-${zoneSizeMeters}m.xlsx`);
      } else if (exportFormat === 'docx') {
        await exportZonesDOCX(report, `binsavvy-zones-report-${timeRange}-${zoneSizeMeters}m.docx`);
      }
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
  const confidenceHistogram = useMemo(() => buildConfidenceHistogram(filteredUploads), [filteredUploads]);

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into waste processing and analysis</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 hover:shadow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
            <SelectTrigger className="w-32 hover:shadow">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              <SelectItem value="docx">Word (.docx)</SelectItem>
              <SelectItem value="txt">Text (.txt)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(zoneSizeMeters)} onValueChange={(v) => setZoneSizeMeters(Number(v))}>
            <SelectTrigger className="w-36 hover:shadow">
              <SelectValue placeholder="Zone size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="250">Zone: 250 m</SelectItem>
              <SelectItem value="500">Zone: 500 m</SelectItem>
              <SelectItem value="1000">Zone: 1 km</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4" checked={includeAddresses} onChange={(e) => setIncludeAddresses(e.target.checked)} />
            Include addresses
          </label>
          <Button onClick={exportAnalytics} disabled={exporting} className="hover:shadow">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Uploads Over Time</CardTitle>
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

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">Processing Status</CardTitle>
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

      {/* Confidence Distribution + Top Locations */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Detection Confidence Distribution</CardTitle>
            <CardDescription>Confidence scores of detections (all images)</CardDescription>
          </CardHeader>
          <CardContent>
            {confidenceHistogram.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No detections yet
              </p>
            ) : (
              <ChartContainer config={{ detections: { label: "Detections", color: "hsl(var(--primary))" } }}>
                <RBarChart data={confidenceHistogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </RBarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">Top Locations</CardTitle>
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
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
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
                <div key={upload.image_id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
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

function buildConfidenceHistogram(uploads: ImageUpload[]) {
  // Build histogram buckets: 0-10, 10-20, ..., 90-100
  const buckets: { [key: string]: number } = {
    '0-10%': 0, '10-20%': 0, '20-30%': 0, '30-40%': 0, '40-50%': 0,
    '50-60%': 0, '60-70%': 0, '70-80%': 0, '80-90%': 0, '90-100%': 0,
  };
  for (const u of uploads) {
    const results = (u as any).analysis_results as { detections?: Array<{ confidence?: number }> } | undefined;
    if (!results?.detections) continue;
    for (const d of results.detections) {
      const c = (d.confidence ?? 0) * 100;
      const idx = Math.min(9, Math.max(0, Math.floor(c / 10)));
      const keys = Object.keys(buckets);
      buckets[keys[idx]] += 1;
    }
  }
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

// Zone clustering and report enrichment
type ZoneReport = {
  zoneId: string;
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  detections: number;
  averageConfidence: number;
  boundingBox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  representativeAddress?: string;
  uploads: Array<{
    image_id: string;
    image_url: string;
    processed_image_url?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    uploaded_at: string;
    detections?: number;
    average_confidence?: number;
    address?: string;
  }>;
};

async function buildZonesReport(
  uploads: ImageUpload[],
  zoneSizeMeters: number,
  includeAddresses: boolean
): Promise<ZoneReport[]> {
  const locs = uploads
    .filter(u => typeof u.latitude === 'number' && typeof u.longitude === 'number')
    .map(u => ({
      ...u,
      lat: (u.latitude as number),
      lng: (u.longitude as number),
      detections: (u.analysis_results?.total_detections as number) || 0,
      avgConf: (u.analysis_results?.average_confidence as number) || 0,
    }));

  const clusters: { centerLat: number; centerLng: number; members: typeof locs }[] = [];
  const R = 6371000; // Earth radius meters
  const dist = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
  };

  for (const loc of locs) {
    let assigned = false;
    for (const c of clusters) {
      const d = dist(loc.lat, loc.lng, c.centerLat, c.centerLng);
      if (d <= zoneSizeMeters) {
        c.members.push(loc);
        // Recompute center as average
        c.centerLat = (c.centerLat * (c.members.length - 1) + loc.lat) / c.members.length;
        c.centerLng = (c.centerLng * (c.members.length - 1) + loc.lng) / c.members.length;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      clusters.push({ centerLat: loc.lat, centerLng: loc.lng, members: [loc] });
    }
  }

  // Optionally enrich with addresses (placeholder using provided location or fallback)
  const zones: ZoneReport[] = clusters.map((c, idx) => {
    const bbox = c.members.reduce(
      (acc, m) => ({
        minLat: Math.min(acc.minLat, m.lat),
        maxLat: Math.max(acc.maxLat, m.lat),
        minLng: Math.min(acc.minLng, m.lng),
        maxLng: Math.max(acc.maxLng, m.lng),
      }),
      { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
    );

    const detections = c.members.reduce((sum, m) => sum + (m.detections || 0), 0);
    const avgConf = c.members.length
      ? c.members.reduce((sum, m) => sum + (m.avgConf || 0), 0) / c.members.length
      : 0;

    const uploadsOut = c.members.map(m => ({
      image_id: m.image_id,
      image_url: m.image_url,
      processed_image_url: (m as any).processed_image_url,
      location: m.location,
      latitude: m.lat,
      longitude: m.lng,
      uploaded_at: m.uploaded_at,
      detections: m.detections,
      average_confidence: m.avgConf,
      address: includeAddresses ? (m.location || undefined) : undefined,
    }));

    return {
      zoneId: `zone-${idx + 1}`,
      center: { latitude: c.centerLat, longitude: c.centerLng },
      radiusMeters: zoneSizeMeters,
      detections,
      averageConfidence: Number((avgConf).toFixed(3)),
      boundingBox: bbox,
      representativeAddress: includeAddresses ? uploadsOut[0]?.address : undefined,
      uploads: uploadsOut,
    };
  });

  return zones.sort((a, b) => b.detections - a.detections);
}

// ---------- Export helpers ----------
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildZonesCSV(report: { meta: any; zones: ZoneReport[] }) {
  const headers = [
    'zoneId','center_lat','center_lng','radius_m','detections','avg_confidence','bbox_minLat','bbox_maxLat','bbox_minLng','bbox_maxLng','representativeAddress'
  ];
  const rows = [headers.join(',')];
  for (const z of report.zones) {
    rows.push([
      z.zoneId,
      z.center.latitude,
      z.center.longitude,
      z.radiusMeters,
      z.detections,
      z.averageConfidence,
      z.boundingBox.minLat,
      z.boundingBox.maxLat,
      z.boundingBox.minLng,
      z.boundingBox.maxLng,
      (z.representativeAddress ?? '').toString().replace(/,/g,';')
    ].join(','));
  }
  rows.push('');
  rows.push('Uploads:');
  rows.push(['zoneId','image_id','lat','lng','detections','avg_confidence','uploaded_at','address','image_url'].join(','));
  for (const z of report.zones) {
    for (const u of z.uploads) {
      rows.push([
        z.zoneId,
        u.image_id,
        u.latitude ?? '',
        u.longitude ?? '',
        u.detections ?? 0,
        u.average_confidence ?? '',
        u.uploaded_at,
        (u.address ?? '').toString().replace(/,/g,';'),
        u.image_url
      ].join(','));
    }
  }
  return rows.join('\n');
}

function buildZonesTXT(report: { meta: any; zones: ZoneReport[] }) {
  const lines: string[] = [];
  lines.push('BinSavvy Zones Report');
  lines.push(`Generated: ${report.meta.generatedAt}`);
  lines.push(`Time Range: ${report.meta.timeRange}`);
  lines.push(`Zone Radius: ${report.meta.zoneSizeMeters} m`);
  lines.push(`Zones: ${report.meta.totals.zones}, Uploads: ${report.meta.totals.uploads}`);
  lines.push('');
  for (const z of report.zones) {
    lines.push(`== ${z.zoneId} ==`);
    lines.push(`Center: (${z.center.latitude.toFixed(6)}, ${z.center.longitude.toFixed(6)}) | Radius: ${z.radiusMeters} m`);
    lines.push(`Detections: ${z.detections} | Avg Confidence: ${(z.averageConfidence*100).toFixed(1)}%`);
    if (z.representativeAddress) lines.push(`Representative address: ${z.representativeAddress}`);
    lines.push('Uploads:');
    for (const u of z.uploads) {
      lines.push(`  - ${u.image_id} | ${u.uploaded_at} | (${u.latitude?.toFixed(6)}, ${u.longitude?.toFixed(6)}) | det: ${u.detections} | conf: ${u.average_confidence !== undefined ? (u.average_confidence*100).toFixed(1)+'%' : 'N/A'} | ${u.address ?? ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function exportZonesXLSX(report: { meta: any; zones: ZoneReport[] }, filename: string) {
  try {
    const XLSX: any = await import('xlsx');
    const zoneTable = report.zones.map(z => ({
      Zone: z.zoneId,
      Center_Lat: z.center.latitude,
      Center_Lng: z.center.longitude,
      Radius_m: z.radiusMeters,
      Detections: z.detections,
      Avg_Confidence: z.averageConfidence,
      BBox_MinLat: z.boundingBox.minLat,
      BBox_MaxLat: z.boundingBox.maxLat,
      BBox_MinLng: z.boundingBox.minLng,
      BBox_MaxLng: z.boundingBox.maxLng,
      Address: z.representativeAddress || ''
    }));

    const uploadsTable = report.zones.flatMap(z =>
      z.uploads.map(u => ({
        Zone: z.zoneId,
        Image_ID: u.image_id,
        Uploaded_At: u.uploaded_at,
        Latitude: u.latitude,
        Longitude: u.longitude,
        Detections: u.detections ?? 0,
        Avg_Confidence: u.average_confidence ?? '',
        Address: u.address || '',
        Image_URL: u.image_url
      }))
    );

    const wb = XLSX.utils.book_new();
    const zonesWS = XLSX.utils.json_to_sheet(zoneTable);
    const uploadsWS = XLSX.utils.json_to_sheet(uploadsTable);
    XLSX.utils.book_append_sheet(wb, zonesWS, 'Zones');
    XLSX.utils.book_append_sheet(wb, uploadsWS, 'Uploads');
    XLSX.writeFile(wb, filename);
  } catch (e) {
    console.error('XLSX export failed, falling back to CSV', e);
    const csv = buildZonesCSV(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveBlob(blob, filename.replace('.xlsx', '.csv'));
  }
}

async function exportZonesDOCX(report: { meta: any; zones: ZoneReport[] }, filename: string) {
  try {
    const docx: any = await import('docx');
    const { Document, Paragraph, Table, TableRow, TableCell, WidthType, Packer, HeadingLevel, TextRun } = docx;

    const heading = new Paragraph({
      text: 'BinSavvy Zones Report',
      heading: HeadingLevel.HEADING_1
    });
    const meta = new Paragraph({
      children: [
        new TextRun(`Generated: ${report.meta.generatedAt}\n`),
        new TextRun(`Time Range: ${report.meta.timeRange}\n`),
        new TextRun(`Zone Radius: ${report.meta.zoneSizeMeters} m\n`),
        new TextRun(`Zones: ${report.meta.totals.zones}, Uploads: ${report.meta.totals.uploads}`)
      ]
    });

    // Zones summary table
    const zoneHeader = new TableRow({
      children: ['Zone','Center (lat,lng)','Radius (m)','Detections','Avg Conf','Address'].map(h => new TableCell({ children: [new Paragraph(String(h))] }))
    });
    const zoneRows = report.zones.map(z => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(z.zoneId)] }),
        new TableCell({ children: [new Paragraph(`${z.center.latitude.toFixed(6)}, ${z.center.longitude.toFixed(6)}`)] }),
        new TableCell({ children: [new Paragraph(String(z.radiusMeters))] }),
        new TableCell({ children: [new Paragraph(String(z.detections))] }),
        new TableCell({ children: [new Paragraph(`${(z.averageConfidence*100).toFixed(1)}%`)] }),
        new TableCell({ children: [new Paragraph(z.representativeAddress || '')] }),
      ]
    }));
    const zonesTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [zoneHeader, ...zoneRows]
    });

    // Per-zone uploads (limit to first 10 per zone for readability)
    const uploadsSections = report.zones.flatMap(z => {
      const title = new Paragraph({ text: `${z.zoneId} uploads`, heading: HeadingLevel.HEADING_2 });
      const header = new TableRow({
        children: ['Image ID','Uploaded At','Lat','Lng','Detections','Avg Conf','Address'].map(h => new TableCell({ children: [new Paragraph(String(h))] }))
      });
      const rows = z.uploads.slice(0, 10).map(u => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(u.image_id)] }),
          new TableCell({ children: [new Paragraph(u.uploaded_at)] }),
          new TableCell({ children: [new Paragraph(u.latitude !== undefined ? u.latitude.toFixed(6) : '')] }),
          new TableCell({ children: [new Paragraph(u.longitude !== undefined ? u.longitude.toFixed(6) : '')] }),
          new TableCell({ children: [new Paragraph(String(u.detections ?? 0))] }),
          new TableCell({ children: [new Paragraph(u.average_confidence !== undefined ? `${(u.average_confidence*100).toFixed(1)}%` : 'N/A')] }),
          new TableCell({ children: [new Paragraph(u.address || '')] }),
        ]
      }));
      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] });
      return [title, table];
    });

    const doc = new Document({ sections: [{ children: [heading, meta, zonesTable, ...uploadsSections] }] });
    const blob = await Packer.toBlob(doc);
    saveBlob(blob, filename);
  } catch (e) {
    console.error('DOCX export failed, falling back to TXT', e);
    const txt = buildZonesTXT(report);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    saveBlob(blob, filename.replace('.docx', '.txt'));
  }
}