import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import { PageHeaderProvider } from "@/contexts/PageHeaderContext";

const MainLayout = () => {
  return (
    <PageHeaderProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <PublicNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </PageHeaderProvider>
  );
};

export default MainLayout;
