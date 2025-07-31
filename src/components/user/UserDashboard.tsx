
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, BarChart3, Settings, User, MapPin, Calendar, Eye } from 'lucide-react';
import BackendStatus from '../BackendStatus';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, ImageUpload } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentImages, setRecentImages] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentImages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserImages();
      if (response.data) {
        // Get the latest 3 images
        const latestImages = response.data
          .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
          .slice(0, 3);
        setRecentImages(latestImages);
      }
    } catch (error) {
      console.error('Error fetching recent images:', error);
      setRecentImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentImages();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending' },
      processing: { variant: 'default' as const, text: 'Processing' },
      completed: { variant: 'default' as const, text: 'Completed' },
      failed: { variant: 'destructive' as const, text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to BinSavvy</h1>
          <p className="text-gray-600">Upload and analyze waste images in your surroundings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">User Dashboard</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentImages.length}</div>
            <p className="text-xs text-muted-foreground">
              Images uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentImages.filter(img => img.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentImages.filter(img => img.status === 'pending' || img.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Account status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BackendStatus />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common actions and settings for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Image
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/history">
                  <Image className="h-4 w-4 mr-2" />
                  View All Images
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest waste analysis contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading recent uploads...</span>
            </div>
          ) : recentImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent uploads yet</p>
              <p className="text-sm">Start by uploading your first waste image</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentImages.map((image) => (
                <div key={image.image_id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={`Waste image from ${image.location}`}
                      className="w-full h-full object-cover rounded"
                      onError={handleImageError}
                    />
                    <div className="absolute -top-1 -right-1">
                      {getStatusBadge(image.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {image.location || "Location Not Specified"}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(image.uploaded_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {image.latitude && image.longitude 
                          ? `${image.latitude.toFixed(4)}, ${image.longitude.toFixed(4)}`
                          : 'No GPS data'
                        }
                      </span>
                    </div>
                    
                    {image.analysis_results && image.analysis_results.detections && (
                      <div className="mt-1">
                        <span className="text-xs text-green-600 font-medium">
                          {image.analysis_results.detections.length} items detected
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/history`}>
                      <Eye className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
              
              {recentImages.length > 0 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/history">
                      View All Images ({recentImages.length})
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
