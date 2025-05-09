
export interface Location {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ImageUpload {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl: string;
  location: Location;
  status: "pending" | "processed" | "analyzing";
  uploadedAt: string;
  analysisResults?: AnalysisResults;
}

export interface AnalysisResults {
  model: "segmentation" | "detection";
  processedImageUrl?: string;
  detectedItems: {
    label: string;
    confidence: number;
    count?: number;
    bbox?: [number, number, number, number]; // [x, y, width, height]
  }[];
  processedAt: string;
}
