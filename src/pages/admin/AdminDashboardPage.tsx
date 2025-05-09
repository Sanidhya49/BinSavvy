
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";

const AdminDashboardPage = () => {
  return (
    <DashboardLayout requireAdmin>
      <AdminDashboard />
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
