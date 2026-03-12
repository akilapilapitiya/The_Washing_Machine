import React from "react";
import { usePageHeader } from "@/contexts/PageHeaderContext";

/**
 * PageSubHeader — sticky white bar below the Navbar.
 * Row 1: label / title / subtitle + optional action button.
 * Row 2 (optional): toolbar — search, filters, tabs declared by the page.
 */
const PageSubHeader = () => {
    const { header } = usePageHeader();

    if (!header.title) return null;

    return (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[64px] z-30">
            {/* Row 1 — Title bar */}
            <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between gap-4">
                {/* Left: label + title + subtitle */}
                <div className="min-w-0">
                    {header.label && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-0.5">
                            {header.label}
                        </p>
                    )}
                    <h1 className="text-lg font-bold tracking-tight text-gray-900 truncate">
                        {header.title}
                    </h1>
                    {header.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                            {header.subtitle}
                        </p>
                    )}
                </div>

                {/* Right: action button */}
                {header.action && (
                    <div className="flex-shrink-0">{header.action}</div>
                )}
            </div>

            {/* Row 2 — Toolbar (search / filters / tabs) */}
            {header.toolbar && (
                <div className="border-t border-gray-100 bg-gray-50/40">
                    <div className="container mx-auto px-4 py-2.5 max-w-7xl">
                        {header.toolbar}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageSubHeader;
