import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MapPin, Camera } from 'lucide-react';
import { apiClient, ImageUpload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadFormProps {
  onUploadSuccess?: (image: ImageUpload) => void;
}

export default function ImageUploadForm({ onUploadSuccess }: ImageUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast({
            title: "Location captured",
            description: "GPS coordinates have been added to your upload.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Could not get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter the location where this image was taken.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiClient.uploadImage(
        selectedFile,
        location,
        latitude,
        longitude
      );

      toast({
        title: "Upload successful",
        description: "Your image has been uploaded and is being processed.",
      });

      // Reset form
      setSelectedFile(null);
      setLocation('');
      setLatitude(undefined);
      setLongitude(undefined);
      setPreview(null);

      // Call success callback
      if (onUploadSuccess && response.data) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Waste Image
        </CardTitle>
        <CardDescription>
          Upload an image of waste in your surroundings with location information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="image" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to select an image
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                type="text"
                placeholder="Enter location (e.g., Central Park, NYC)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                title="Get current location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* GPS Coordinates (optional) */}
          {(latitude !== undefined || longitude !== undefined) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Latitude"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Longitude"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || !selectedFile || !location.trim()}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 