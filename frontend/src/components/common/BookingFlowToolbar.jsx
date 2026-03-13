import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const BookingToolbarActionButton = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      className={cn(
        "h-9 px-6 bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition-all duration-200 disabled:opacity-50 flex-shrink-0 whitespace-nowrap",
        className,
      )}
    >
      {children}
    </Button>
  ),
);

BookingToolbarActionButton.displayName = "BookingToolbarActionButton";

export const BookingToolbarBackButton = React.forwardRef(
  ({ className, children = "Back", ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      {...props}
      className={cn(
        "h-9 px-5 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-sm shadow-sm transition-all duration-200",
        className,
      )}
    >
      {children}
    </Button>
  ),
);

BookingToolbarBackButton.displayName = "BookingToolbarBackButton";

const BookingFlowToolbar = ({
  tabs = [],
  activeTab,
  onTabChange,
  tabsAriaLabel = "Toolbar tabs",
  searchValue = "",
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "Search...",
  searchWidthClass = "max-w-sm",
  meta = null,
  centerSlot = null,
  rightSlot = null,
  className = "",
}) => {
  const showTabs = tabs.length > 0 && typeof onTabChange === "function";
  const showSearch = typeof onSearchChange === "function";

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full justify-between flex-wrap xl:flex-nowrap",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        {showTabs && (
          <div
            role="tablist"
            aria-label={tabsAriaLabel}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 overflow-x-auto max-w-full"
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && onTabChange(tab.id)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap",
                    isSelected
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    tab.disabled &&
                      "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500",
                  )}
                >
                  {TabIcon ? <TabIcon size={13} /> : null}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {showSearch && (
          <div className={cn("relative flex-1 min-w-[220px]", searchWidthClass)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-10 pr-8 h-9 text-sm bg-white border-gray-200"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  if (typeof onSearchClear === "function") {
                    onSearchClear();
                  } else {
                    onSearchChange("");
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {meta}
      </div>

      {(centerSlot || rightSlot) && (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {centerSlot}
          {rightSlot}
        </div>
      )}
    </div>
  );
};

export default BookingFlowToolbar;
