import { Layout } from "antd";

import AdminContent from "@/components/userLayout/admin.content";
import AdminFooter from "@/components/userLayout/admin.foodter";
import AdminHeader from "@/components/userLayout/admin.header";
import AdminSideBar from "@/components/userLayout/admin.sidebar";

const AdminLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <Layout>
      <AdminSideBar />
      <Layout>
        <AdminHeader />
        <AdminContent>{children}</AdminContent>
        <AdminFooter />
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
