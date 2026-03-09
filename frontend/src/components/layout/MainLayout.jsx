import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import { PageHeaderProvider } from "@/contexts/PageHeaderContext";
import PageSubHeader from "./PageSubHeader";

const MainLayout = () => {
  return (
    <PageHeaderProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <PageSubHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </PageHeaderProvider>
  );
};

export default MainLayout;
