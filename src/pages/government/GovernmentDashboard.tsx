import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface WasteReport {
  image_id: string;
  image_url: string;
  location: string;
  latitude?: number;
  longitude?: number;
  uploaded_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_image_url?: string;
  analysis_results?: any;
  error_message?: string;
}

export default function GovernmentDashboard() {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserImages();
      if (response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || report.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      processing: { variant: 'default' as const, text: 'Processing', icon: Clock },
      completed: { variant: 'default' as const, text: 'Completed', icon: CheckCircle },
      failed: { variant: 'destructive' as const, text: 'Failed', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getStats = () => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const pending = reports.filter(r => r.status === 'pending' || r.status === 'processing').length;

    return { total, completed, failed, pending };
  };

  const stats = getStats();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading waste reports...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-800">Government Waste Management Dashboard</h1>
          <p className="text-gray-600">Monitor and manage citizen waste reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            Government Access
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Citizen submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Processing errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Location</label>
              <Input
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchReports}>
                  <Search className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Waste Reports ({filteredReports.length})</h2>
        </div>

        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-gray-600">
                No waste reports match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card key={report.image_id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={report.image_url}
                    alt={`Waste report from ${report.location}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">
                    {report.location}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDate(report.uploaded_at)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {report.latitude && report.longitude 
                          ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                          : 'No GPS data'
                        }
                      </span>
                    </div>
                    
                    {report.analysis_results && report.analysis_results.total_detections && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          {report.analysis_results.total_detections} items detected
                        </span>
                      </div>
                    )}
                    
                    {report.error_message && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">
                          {report.error_message}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Waste Report Details</DialogTitle>
            <DialogDescription>
              Detailed information about the waste report and analysis results.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Original Image</h4>
                  <div className="aspect-video">
                    <img
                      src={selectedReport.image_url}
                      alt={`Waste report from ${selectedReport.location}`}
                      className="w-full h-full object-cover rounded"
                      onError={handleImageError}
                    />
                  </div>
                </div>
                
                {selectedReport.processed_image_url && (
                  <div>
                    <h4 className="font-semibold mb-2">Processed Image</h4>
                    <div className="aspect-video">
                      <img
                        src={selectedReport.processed_image_url}
                        alt="Processed waste image"
                        className="w-full h-full object-cover rounded"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location Information</h4>
                  <p className="text-sm text-gray-600">{selectedReport.location}</p>
                  {selectedReport.latitude && selectedReport.longitude && (
                    <p className="text-sm text-gray-600 mt-1">
                      GPS: {selectedReport.latitude}, {selectedReport.longitude}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Report Status</h4>
                  {getStatusBadge(selectedReport.status)}
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedReport.uploaded_at)}
                  </p>
                </div>
              </div>

              {selectedReport.analysis_results && Object.keys(selectedReport.analysis_results).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Analysis Results</h4>
                  <div className="bg-gray-100 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Detections</p>
                        <p className="text-lg font-bold text-green-600">
                          {selectedReport.analysis_results.total_detections || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Average Confidence</p>
                        <p className="text-lg font-bold text-blue-600">
                          {selectedReport.analysis_results.average_confidence || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedReport.analysis_results.waste_types && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Waste Types Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedReport.analysis_results.waste_types).map(([type, count]) => (
                            <Badge key={type} variant="outline">
                              {type}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedReport.analysis_results.detections && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Detailed Detections</p>
                        <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(selectedReport.analysis_results.detections, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedReport.error_message && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Error Information</h4>
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-sm text-red-800">{selectedReport.error_message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 