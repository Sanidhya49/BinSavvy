
import { useEffect, useState } from "react";
import { ImageUpload } from "@/types/waste";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case "analyzing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Analyzing</Badge>;
    case "processed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Processed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const UploadHistory = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchUploads = () => {
      setLoading(true);
      try {
        // Get uploads from localStorage
        const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
        
        // Filter uploads for the current user
        const userUploads = allUploads.filter(upload => upload.userId === user?.id);
        
        setUploads(userUploads);
      } catch (error) {
        console.error("Error fetching uploads:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUploads();
  }, [user?.id]);

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
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {uploads.map((upload) => (
        <Card key={upload.id} className="overflow-hidden">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={upload.thumbnailUrl}
              alt="Uploaded waste"
              className="w-full h-full object-cover"
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
                    {upload.location.address || "Location Not Specified"}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(upload.uploadedAt), { addSuffix: true })}
                </span>
                {upload.analysisResults && (
                  <span className="text-binsavvy-600 font-medium">
                    {upload.analysisResults.detectedItems.length} items detected
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UploadHistory;
