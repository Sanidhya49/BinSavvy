
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserDashboard from "@/components/user/UserDashboard";

const Dashboard = () => {
  console.log('Dashboard component rendering');
  
  return (
    <DashboardLayout>
      <UserDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
