
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

const UploadForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [useGps, setUseGps] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      setUseGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("GPS location captured successfully!");
        },
        () => {
          toast.error("Unable to retrieve your location");
          setUseGps(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }
    
    if (!address.trim() && !useGps) {
      toast.error("Please provide location information");
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the backend API to upload the image
      const response = await apiClient.uploadImage(
        selectedFile,
        address.trim() || "GPS Location",
        latitude,
        longitude,
        true // Skip automatic ML processing - let admin trigger it manually
      );
      
      toast.success("Image uploaded successfully!");
      
      // Clear form
      setSelectedFile(null);
      setPreviewUrl(null);
      setAddress("");
      setLatitude(null);
      setLongitude(null);
      setUseGps(false);
      
      // Navigate to history page
      navigate("/history");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Waste Image</CardTitle>
        <CardDescription>
          Upload photos of waste in your surroundings to help us analyze and address waste management issues. 
          Your uploads will be reviewed and processed by our administrators.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpload}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="border rounded-md p-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP. Max size: 10MB.
                </p>
              </div>
              <div className="flex items-center justify-center border rounded-md p-2 min-h-[150px] bg-muted/30">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[200px] max-w-full object-contain rounded"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Image preview will appear here
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location Information</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getGeoLocation}
                className="text-xs"
                disabled={useGps && latitude !== null}
              >
                {useGps && latitude !== null ? "GPS Location Captured" : "Use GPS"}
              </Button>
            </div>
            <Textarea
              id="location"
              placeholder="Enter the address or description of where this photo was taken..."
              value={address}
              onChange={handleAddressChange}
              rows={3}
              disabled={loading}
            />
            {useGps && latitude !== null && (
              <div className="text-xs text-muted-foreground">
                GPS Coordinates: {latitude.toFixed(6)}, {longitude?.toFixed(6)}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full button-gradient"
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">○</span>
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UploadForm;
