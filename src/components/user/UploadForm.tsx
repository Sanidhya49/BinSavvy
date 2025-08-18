
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

const UploadForm = () => {
  const { user, refreshData } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [useGps, setUseGps] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      streamRef.current = null;
      if (videoRef.current) {
        // @ts-expect-error - MediaStream typing for srcObject
        videoRef.current.srcObject = null;
      }
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera is not supported on this device/browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        // @ts-expect-error - MediaStream typing for srcObject
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
    } catch (err) {
      console.error("Camera open failed:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Capture failed. Try again.");
          return;
        }
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setCameraOpen(false);
        stopCamera();
        toast.success("Photo captured from camera");
      },
      "image/jpeg",
      0.92
    );
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
      
      console.log('Uploading image with location:', address.trim() || "GPS Location");
      
      // Use the backend API to upload the image
      const response = await apiClient.uploadImage(
        selectedFile,
        address.trim() || "GPS Location",
        latitude,
        longitude,
        false // Enable automatic ML processing
      );
      
      console.log('Upload response:', response);
      
      if (response.success) {
        toast.success("Image uploaded successfully!");
        
        // Trigger global data refresh
        refreshData();
        
        // Clear form
        setSelectedFile(null);
        setPreviewUrl(null);
        setAddress("");
        setLatitude(null);
        setLongitude(null);
        setUseGps(false);
        
        // Navigate to history page after a short delay to ensure backend processes the image
        setTimeout(() => {
          navigate("/history");
        }, 1000);
      } else {
        toast.error(response.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upload Waste Image</CardTitle>
        <CardDescription>
          Upload photos of waste in your surroundings to help us analyze and address waste management issues. 
          Your uploads will be automatically processed using our ML models.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpload}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="border rounded-md p-2 hover:shadow-sm transition-shadow">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    {...({ capture: "environment" } as any)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={openCamera} className="text-xs hover:shadow">
                    Use Camera
                  </Button>
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
                className="text-xs hover:shadow"
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
      <Dialog open={cameraOpen} onOpenChange={(open) => { setCameraOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
            <DialogDescription>Align the waste in frame and tap capture.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-md overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={captureFromCamera}>
                Capture Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UploadForm;
