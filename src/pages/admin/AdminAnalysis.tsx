import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient, ImageUpload } from '@/lib/api';
import { toast } from 'sonner';

const AdminAnalysis = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const [imageData, setImageData] = useState<ImageUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageId) {
      fetchImageData();
    }
  }, [imageId]);

  const fetchImageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getUserImages();
      if (response.success && response.data) {
        const imagesArray = Array.isArray(response.data) ? response.data : response.data.data || [];
        const foundImage = imagesArray.find(img => img.image_id === imageId);
        
        if (foundImage) {
          setImageData(foundImage);
        } else {
          setError('Image not found');
        }
      } else {
        setError('Failed to fetch image data');
      }
    } catch (err) {
      console.error('Error fetching image data:', err);
      setError('Failed to load image data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
      case 'ml_failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getDetectionStatus = (analysisResults: any) => {
    if (!analysisResults || !analysisResults.total_detections) {
      return { text: 'Not detected', color: 'text-gray-600', icon: AlertTriangle };
    }
    
    const detections = analysisResults.total_detections;
    if (detections > 0) {
      return { text: 'Garbage detected', color: 'text-green-600', icon: CheckCircle };
    } else {
      return { text: 'Not detected', color: 'text-gray-600', icon: AlertTriangle };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <div className="text-center py-6 sm:py-8">
          <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Error Loading Analysis</h2>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error || 'Image not found'}</p>
          <Button asChild className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0">
            <Link to="/admin/uploads">Back to Uploads</Link>
          </Button>
        </div>
      </div>
    );
  }

  const detectionStatus = getDetectionStatus(imageData.analysis_results);

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link to="/admin/uploads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Uploads
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Image Analysis
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Detailed analysis results</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {/* Export and Share buttons removed - not functional */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Original Image */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Original Image
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Uploaded image before processing</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={imageData.image_url}
                alt={`Original waste image from ${imageData.location}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(imageData.status)}
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span><strong>Location:</strong> {imageData.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span><strong>Uploaded:</strong> {formatDate(imageData.uploaded_at)}</span>
              </div>
              {imageData.latitude && imageData.longitude && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span><strong>GPS:</strong> {imageData.latitude.toFixed(4)}, {imageData.longitude.toFixed(4)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">ML model detection results</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {imageData.analysis_results ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Detection Status */}
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <detectionStatus.icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 ${detectionStatus.color}`} />
                  <h3 className={`text-base sm:text-lg font-semibold ${detectionStatus.color}`}>
                    {detectionStatus.text}
                  </h3>
                </div>

                {/* Processed Image */}
                {imageData.processed_image_url ? (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Processed Image</h4>
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
                      <img
                        src={imageData.processed_image_url}
                        alt="Processed waste image with detections"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Processed image failed to load, falling back to original');
                          e.currentTarget.src = imageData.image_url;
                        }}
                        onLoad={() => {
                          console.log('Processed image loaded successfully');
                        }}
                      />
                      {imageData.processed_image_url === imageData.image_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs sm:text-sm">
                          <div className="text-center">
                            <p>Processing in progress...</p>
                            <p className="text-xs mt-1">Detection overlays will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Processed Image</h4>
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-xs sm:text-sm">Processing image...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Details */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="font-medium text-sm sm:text-base">Analysis Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    
                    {imageData.analysis_results.average_confidence && (
                      <div className="p-2 bg-gray-50 rounded">
                        <strong>Average Confidence:</strong> {(imageData.analysis_results.average_confidence * 100).toFixed(1)}%
                      </div>
                    )}
                    {imageData.analysis_results.message && (
                      <div className="col-span-1 sm:col-span-2 p-2 bg-gray-50 rounded">
                        <strong>Message:</strong> {imageData.analysis_results.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-3 sm:mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">No analysis results available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-green-50 to-blue-50/95 backdrop-blur border-t border-green-200 p-3">
        <div className="flex gap-2">
          <Button asChild className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0">
            <Link to="/admin/uploads">Back</Link>
          </Button>
        </div>
      </div>
      
      {/* Mobile bottom padding to prevent content from being hidden behind fixed actions */}
      <div className="sm:hidden h-20"></div>
    </div>
  );
};

export default AdminAnalysis;
