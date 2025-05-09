
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadHistory from "@/components/user/UploadHistory";

const History = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Upload History</h1>
        <p className="text-muted-foreground">
          View and manage your waste image contributions
        </p>
        <UploadHistory />
      </div>
    </DashboardLayout>
  );
};

export default History;
