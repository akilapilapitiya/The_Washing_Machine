import React from "react";
import { usePageHeader } from "@/contexts/PageHeaderContext";

/**
 * PageSubHeader — thin white bar below the Navbar.
 * Only renders when a page has set a title via useSetPageHeader().
 */
const PageSubHeader = () => {
    const { header } = usePageHeader();

    if (!header.title) return null;

    return (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[64px] z-30">
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

                {/* Right: action (e.g. Add Vehicle button) */}
                {header.action && (
                    <div className="flex-shrink-0">{header.action}</div>
                )}
            </div>
        </div>
    );
};

export default PageSubHeader;
