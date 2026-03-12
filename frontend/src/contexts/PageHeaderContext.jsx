import React, { createContext, useContext, useState, useEffect } from "react";

const PageHeaderContext = createContext(null);
const EMPTY_HEADER = {
    label: "",
    title: "",
    subtitle: "",
    action: null,
    toolbar: null,
};

export const PageHeaderProvider = ({ children }) => {
    const [header, setHeader] = useState(EMPTY_HEADER);

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
export const useSetPageHeader = (label, title, subtitle = "", action = null, toolbar = null) => {
    const { setHeader } = usePageHeader();

    useEffect(() => {
        setHeader((prev) => {
            if (
                prev.label === label
                && prev.title === title
                && prev.subtitle === subtitle
                && prev.action === action
                && prev.toolbar === toolbar
            ) {
                return prev;
            }

            return { label, title, subtitle, action, toolbar };
        });
    }, [label, title, subtitle, action, toolbar, setHeader]);

    useEffect(() => () => {
        setHeader((prev) => {
            if (
                prev.label === ""
                && prev.title === ""
                && prev.subtitle === ""
                && prev.action === null
                && prev.toolbar === null
            ) {
                return prev;
            }
            return EMPTY_HEADER;
        });
    }, [setHeader]);
};
