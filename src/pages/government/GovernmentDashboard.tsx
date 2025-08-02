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
  Image as ImageIcon,
  RefreshCw
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
  console.log('GovernmentDashboard component rendering...');
  
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      console.log('Starting fetchReports...');
      setLoading(true);
      setError(null);
      console.log('Fetching reports from government dashboard...');
      
      const response = await apiClient.getUserImages();
      console.log('Government dashboard response:', response);
      
      if (response && response.data) {
        setReports(response.data);
        console.log('Reports loaded:', response.data.length);
      } else {
        console.log('No data in response');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load waste reports. Please try again.');
      setReports([]);
    } finally {
      console.log('Setting loading to false...');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('GovernmentDashboard useEffect running...');
    fetchReports();
  }, []);

  console.log('Rendering with loading:', loading, 'error:', error, 'reports:', reports.length);

  if (loading) {
    console.log('Rendering loading state...');
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading waste reports...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state...');
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchReports} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering main content...');
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Debug Info</h3>
        <p className="text-sm text-blue-700">Reports loaded: {reports.length}</p>
        <p className="text-sm text-blue-700">Loading: {loading.toString()}</p>
        <p className="text-sm text-blue-700">Error: {error || 'None'}</p>
      </div>

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

      {/* Simple Content */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Reports</CardTitle>
          <CardDescription>Total reports: {reports.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-gray-500">No waste reports found.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((report, index) => (
                <div key={report.image_id || index} className="p-3 border rounded">
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Status:</strong> {report.status}</p>
                  <p><strong>Uploaded:</strong> {new Date(report.uploaded_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 