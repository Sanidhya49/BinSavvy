
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadsManagement from "@/components/admin/UploadsManagement";

const AdminUploads = () => {
  return (
    <DashboardLayout requireAdmin>
      <UploadsManagement />
    </DashboardLayout>
  );
};

export default AdminUploads;
