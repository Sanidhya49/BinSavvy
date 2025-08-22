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
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Analysis</h2>
          <p className="text-muted-foreground mb-4">{error || 'Image not found'}</p>
          <Button asChild>
            <Link to="/admin/uploads">Back to Uploads</Link>
          </Button>
        </div>
      </div>
    );
  }

  const detectionStatus = getDetectionStatus(imageData.analysis_results);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/uploads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Uploads
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Image Analysis
            </h1>
            <p className="text-sm text-muted-foreground">Detailed analysis results</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Original Image */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Original Image
            </CardTitle>
            <CardDescription>Uploaded image before processing</CardDescription>
          </CardHeader>
          <CardContent>
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
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span><strong>Location:</strong> {imageData.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><strong>Uploaded:</strong> {formatDate(imageData.uploaded_at)}</span>
              </div>
              {imageData.latitude && imageData.longitude && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span><strong>GPS:</strong> {imageData.latitude.toFixed(4)}, {imageData.longitude.toFixed(4)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>ML model detection results</CardDescription>
          </CardHeader>
          <CardContent>
            {imageData.analysis_results ? (
              <div className="space-y-6">
                {/* Detection Status */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <detectionStatus.icon className={`h-8 w-8 mx-auto mb-2 ${detectionStatus.color}`} />
                  <h3 className={`text-lg font-semibold ${detectionStatus.color}`}>
                    {detectionStatus.text}
                  </h3>
                </div>

                                 {/* Processed Image */}
                 {imageData.processed_image_url ? (
                   <div>
                     <h4 className="font-medium mb-2">Processed Image</h4>
                     <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-50">
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
                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm">
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
                     <h4 className="font-medium mb-2">Processed Image</h4>
                     <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                       <div className="text-center text-gray-500">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                         <p>Processing image...</p>
                       </div>
                     </div>
                   </div>
                 )}

                {/* Analysis Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">Analysis Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    
                    {imageData.analysis_results.average_confidence && (
                      <div>
                        <strong>Average Confidence:</strong> {(imageData.analysis_results.average_confidence * 100).toFixed(1)}%
                      </div>
                    )}
                    {imageData.analysis_results.message && (
                      <div className="col-span-2">
                        <strong>Message:</strong> {imageData.analysis_results.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No analysis results available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

             {/* Mobile Actions */}
       <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t p-3">
         <div className="flex gap-2">
           <Button asChild className="flex-1">
             <Link to="/admin/uploads">Back</Link>
           </Button>
           <Button variant="outline" className="flex-1">
             <Download className="h-4 w-4 mr-2" />
             Export
           </Button>
         </div>
       </div>
       
       {/* Mobile bottom padding to prevent content from being hidden behind fixed actions */}
       <div className="sm:hidden h-20"></div>
    </div>
  );
};

export default AdminAnalysis;
