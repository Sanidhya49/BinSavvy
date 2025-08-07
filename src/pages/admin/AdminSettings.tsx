import DashboardLayout from "@/components/layout/DashboardLayout";
import MLConfigPanel from "@/components/admin/MLConfigPanel";

const AdminSettings = () => {
  return (
    <DashboardLayout requireAdmin>
      <MLConfigPanel />
    </DashboardLayout>
  );
};

export default AdminSettings; 