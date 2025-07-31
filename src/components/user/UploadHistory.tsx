
import { useEffect, useState } from "react";
import { ImageUpload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const UploadHistory = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserImages();
      if (response.data) {
        setUploads(response.data);
      } else {
        setUploads([]);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      toast.error("Failed to load upload history");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">You haven't uploaded any images yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start by uploading your first waste image from the Upload page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {uploads.map((upload) => (
        <Card key={upload.image_id} className="overflow-hidden">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={upload.image_url}
              alt={`Waste image from ${upload.location}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={(e) => {
                // Log successful image loads for debugging
                console.log(`Image loaded successfully: ${upload.image_id}`);
              }}
            />
            <div className="absolute top-2 right-2">
              <StatusBadge status={upload.status} />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="truncate flex-1">
                  <p className="text-sm font-medium truncate">
                    {upload.location || "Location Not Specified"}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(upload.uploaded_at), { addSuffix: true })}
                </span>
                {upload.analysis_results && upload.analysis_results.detections && (
                  <span className="text-binsavvy-600 font-medium">
                    {upload.analysis_results.detections.length} items detected
                  </span>
                )}
              </div>
              {upload.latitude && upload.longitude && (
                <div className="text-xs text-muted-foreground">
                  GPS: {upload.latitude.toFixed(4)}, {upload.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UploadHistory;
