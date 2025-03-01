"use client";

import { Layout } from "antd";

const AdminFooter = () => {
  const { Footer } = Layout;

  return (
    <Footer style={{ textAlign: "center" }}>
      Edu Forge ©{new Date().getFullYear()} Created by @ThinhDeepTry
    </Footer>
  );
};
export default AdminFooter;
