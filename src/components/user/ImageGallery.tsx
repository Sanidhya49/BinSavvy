import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, MapPin, Calendar, Trash2, Eye, Loader2 } from 'lucide-react';
import { apiClient, ImageUpload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ImageGalleryProps {
  refreshTrigger?: number;
}

export default function ImageGallery({ refreshTrigger }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageUpload | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserImages();
      if (response.data) {
        setImages(response.data);
      }
    } catch (error) {
      toast({
        title: "Failed to load images",
        description: error instanceof Error ? error.message : "Could not load your images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const handleDeleteImage = async (imageId: string) => {
    try {
      await apiClient.deleteImage(imageId);
      setImages(images.filter(img => img.image_id !== imageId));
      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending' },
      processing: { variant: 'default' as const, text: 'Processing' },
      completed: { variant: 'default' as const, text: 'Completed' },
      failed: { variant: 'destructive' as const, text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
        {config.text}
      </Badge>
    );
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
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading images...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Image className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No images uploaded yet</h3>
          <p className="text-gray-600 mb-4">
            Start by uploading your first waste image to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Uploaded Images</h2>
          <Button onClick={fetchImages} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.image_id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={image.image_url}
                  alt={`Waste image from ${image.location}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(image.status)}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate">
                  {image.location}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {formatDate(image.uploaded_at)}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {image.latitude && image.longitude 
                        ? `${image.latitude.toFixed(4)}, ${image.longitude.toFixed(4)}`
                        : 'No GPS data'
                      }
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteImage(image.image_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Image Detail Dialog - Outside the map function */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>
              Detailed information about the uploaded image and analysis results.
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video">
                <img
                  src={selectedImage.image_url}
                  alt={`Waste image from ${selectedImage.location}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-sm text-gray-600">{selectedImage.location}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  {getStatusBadge(selectedImage.status)}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Upload Date</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedImage.uploaded_at)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">GPS Coordinates</h4>
                  <p className="text-sm text-gray-600">
                    {selectedImage.latitude && selectedImage.longitude
                      ? `${selectedImage.latitude}, ${selectedImage.longitude}`
                      : 'Not available'
                    }
                  </p>
                </div>
              </div>

              {selectedImage.processed_image_url && (
                <div>
                  <h4 className="font-semibold mb-2">Processed Image</h4>
                  <img
                    src={selectedImage.processed_image_url}
                    alt="Processed waste image"
                    className="w-full rounded"
                  />
                </div>
              )}

              {selectedImage.analysis_results && Object.keys(selectedImage.analysis_results).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Analysis Results</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedImage.analysis_results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 