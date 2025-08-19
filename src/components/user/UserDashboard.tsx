
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, BarChart3, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, ImageUpload } from '@/lib/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentImages, setRecentImages] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentImages = async () => {
    try {
      setLoading(true);
      console.log('Fetching recent images for user dashboard...');
      
      const response = await apiClient.getUserImages();
      console.log('User dashboard response:', response);
      
      if (response.success && response.data) {
        // Handle backend response format: { data: [...] }
        const imagesArray = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        // Get the latest 3 images
        const latestImages = imagesArray
          .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
          .slice(0, 3);
        console.log('Setting recent images:', latestImages);
        setRecentImages(latestImages);
      } else {
        console.log('No images found or API error:', response.error);
        setRecentImages([]);
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
    
    // Set up auto-refresh every 20 seconds for user dashboard
    const interval = setInterval(() => {
      console.log('Auto-refreshing user dashboard...');
      fetchRecentImages();
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);

  // Refresh when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('User dashboard focused, refreshing data...');
      fetchRecentImages();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Welcome to BinSavvy</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload and analyze waste images in your surroundings</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="secondary">User Dashboard</Badge>
        </div>
      </div>

      {/* User Info */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Welcome, {user?.username || 'User'}!</CardTitle>
          <CardDescription>
            You are logged in as a {user?.role || 'user'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Username:</strong> {user?.username}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Role:</strong> {user?.role}
            </div>
            <div>
              <strong>Admin:</strong> {user?.is_admin ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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

        <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
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
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common actions and settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild className="hover:shadow w-full sm:w-auto">
              <a href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Image
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="hover:shadow w-full sm:w-auto">
              <a href="/history">
                <Image className="h-4 w-4 mr-2" />
                View All Images
              </a>
            </Button>
            
            <Button variant="outline" size="sm" className="hover:shadow w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
          <CardDescription>
            Your latest waste analysis contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading recent uploads...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading recent uploads</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRecentImages}
                className="mt-2 hover:shadow"
              >
                Retry
              </Button>
            </div>
          ) : recentImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent uploads yet</p>
              <p className="text-sm">Start by uploading your first waste image</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentImages.map((image) => (
                <div key={image.image_id} className="flex items-center gap-3 sm:gap-4 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={`Waste image from ${image.location}`}
                      className="w-full h-full object-cover rounded transform transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="secondary" className="text-xs">
                        {image.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {image.location || "Location Not Specified"}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(image.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        {image.latitude && image.longitude 
                          ? `${image.latitude.toFixed(4)}, ${image.longitude.toFixed(4)}`
                          : 'No GPS data'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild className="ml-auto">
                    <a href={`/history`}>
                      <Image className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
              
              {recentImages.length > 0 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild className="hover:shadow w-full sm:w-auto">
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
