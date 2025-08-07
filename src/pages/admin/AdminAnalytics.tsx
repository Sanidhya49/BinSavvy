import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

const AdminAnalytics = () => {
  return (
    <DashboardLayout requireAdmin>
      <AnalyticsDashboard />
    </DashboardLayout>
  );
};

export default AdminAnalytics; 