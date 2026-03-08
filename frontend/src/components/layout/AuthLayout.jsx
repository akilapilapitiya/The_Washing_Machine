import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Auth Layout — clean, no Navbar.
 * Auth pages (login, signup, forgot password) render in here.
 */
const AuthLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;
