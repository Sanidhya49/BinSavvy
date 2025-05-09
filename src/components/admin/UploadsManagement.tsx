
import { useState, useEffect } from "react";
import { ImageUpload } from "@/types/waste";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";

const UploadsManagement = () => {
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<ImageUpload | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processed" | "analyzing">("all");

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchUploads = () => {
      setLoading(true);
      try {
        // Get uploads from localStorage
        const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
        setUploads(allUploads);
      } catch (error) {
        console.error("Error fetching uploads:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUploads();
  }, []);

  const handleStartAnalysis = (upload: ImageUpload) => {
    // Update the upload status to "analyzing"
    const updatedUpload = { ...upload, status: "analyzing" as const };
    
    // Update in state and localStorage
    const updatedUploads = uploads.map(u => 
      u.id === upload.id ? updatedUpload : u
    );
    
    setUploads(updatedUploads);
    localStorage.setItem('binsavvy-uploads', JSON.stringify(updatedUploads));
    setSelectedUpload(updatedUpload);
    
    toast.success("Analysis process started");
  };

  const filteredUploads = filter === "all" 
    ? uploads 
    : uploads.filter(upload => upload.status === filter);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Uploads</h1>
        <div className="flex space-x-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button 
            variant={filter === "analyzing" ? "default" : "outline"}
            onClick={() => setFilter("analyzing")}
          >
            Analyzing
          </Button>
          <Button 
            variant={filter === "processed" ? "default" : "outline"}
            onClick={() => setFilter("processed")}
          >
            Processed
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Uploads List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUploads.length === 0 ? (
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No {filter} uploads available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUploads.map((upload) => (
                <Card 
                  key={upload.id} 
                  className={`overflow-hidden cursor-pointer transition-all border-2 ${
                    selectedUpload?.id === upload.id ? "border-primary" : "border-border"
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={upload.thumbnailUrl}
                      alt="Uploaded waste"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={upload.status} />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(upload.uploadedAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm truncate">
                        {upload.location.address || "No location data"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Upload Details */}
        <div>
          {selectedUpload ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={selectedUpload.imageUrl}
                  alt="Selected waste"
                  className="w-full aspect-video object-cover rounded-md"
                />
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="mt-1">
                      <StatusBadge status={selectedUpload.status} />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpload.location.address || "No address provided"}
                    </p>
                    {(selectedUpload.location.latitude && selectedUpload.location.longitude) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {selectedUpload.location.latitude.toFixed(6)}, 
                        {selectedUpload.location.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Upload Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedUpload.uploadedAt), "PPpp")}
                    </p>
                  </div>
                  
                  {selectedUpload.analysisResults ? (
                    <div>
                      <h4 className="text-sm font-medium">Analysis Results</h4>
                      <p className="text-sm text-muted-foreground">
                        Model: {selectedUpload.analysisResults.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Items detected: {selectedUpload.analysisResults.detectedItems.length}
                      </p>
                      <Link to={`/admin/analysis/${selectedUpload.id}`}>
                        <Button variant="outline" className="mt-2 text-xs" size="sm">
                          View Analysis Results
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2">
                      {selectedUpload.status === "pending" && (
                        <Button 
                          onClick={() => handleStartAnalysis(selectedUpload)}
                          className="w-full button-gradient"
                        >
                          Start Analysis
                        </Button>
                      )}
                      
                      {selectedUpload.status === "analyzing" && (
                        <Button 
                          variant="outline"
                          className="w-full" 
                          asChild
                        >
                          <Link to={`/admin/analysis/${selectedUpload.id}`}>
                            Continue Analysis
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Select an upload to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadsManagement;
