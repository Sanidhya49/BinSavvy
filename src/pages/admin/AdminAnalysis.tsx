
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalysisPanel from "@/components/admin/AnalysisPanel";

const AdminAnalysis = () => {
  return (
    <DashboardLayout requireAdmin>
      <AnalysisPanel />
    </DashboardLayout>
  );
};

export default AdminAnalysis;
