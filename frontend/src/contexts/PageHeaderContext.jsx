import React, { createContext, useContext, useState, useEffect } from "react";

const PageHeaderContext = createContext(null);

export const PageHeaderProvider = ({ children }) => {
    const [header, setHeader] = useState({
        label: "",
        title: "",
        subtitle: "",
        action: null,
    });

    return (
        <PageHeaderContext.Provider value={{ header, setHeader }}>
            {children}
        </PageHeaderContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePageHeader = () => {
    const ctx = useContext(PageHeaderContext);
    if (!ctx) throw new Error("usePageHeader must be used within PageHeaderProvider");
    return ctx;
};

/**
 * useSetPageHeader — call inside any page to declare the sub-header bar content.
 * @param {string} label   - small red overline label (e.g. "Garage")
 * @param {string} title   - main h1 text (e.g. "Manage your vehicles")
 * @param {string} subtitle - optional description line
 * @param {React.ReactNode} action - optional right-side node (e.g. a Button)
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useSetPageHeader = (label, title, subtitle = "", action = null) => {
    const { setHeader } = usePageHeader();

    useEffect(() => {
        setHeader({ label, title, subtitle, action });
        // Clear on unmount so auth/booking pages show no bar
        return () => setHeader({ label: "", title: "", subtitle: "", action: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [label, title, subtitle]);
};
