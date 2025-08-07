import DashboardLayout from "@/components/layout/DashboardLayout";
import EnhancedMLProcessor from "@/components/admin/EnhancedMLProcessor";

const AdminMLProcessor = () => {
  return (
    <DashboardLayout requireAdmin>
      <EnhancedMLProcessor />
    </DashboardLayout>
  );
};

export default AdminMLProcessor; 