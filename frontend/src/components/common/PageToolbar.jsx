import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const PageToolbar = ({
  stats = [],
  filters = [],
  activeFilter = "all",
  onFilterChange = null,
  searchValue = "",
  onSearchChange = null,
  searchPlaceholder = "Search records...",
  leftSlot = null,
  rightSlot = null,
  searchWidthClass = "sm:w-72",
  className = "",
}) => {
  const showSearch = typeof onSearchChange === "function";
  const showFilters = filters.length > 0 && typeof onFilterChange === "function";

  return (
    <div
      className={`flex flex-col xl:flex-row w-full gap-4 items-start xl:items-center justify-between ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {leftSlot}
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              {Icon ? (
                <Icon
                  size={14}
                  className={stat.iconClassName || "text-gray-500"}
                />
              ) : null}
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-sm font-black text-gray-900">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {(showFilters || showSearch || rightSlot) && (
        <div className="flex flex-1 w-full xl:w-auto items-center gap-3 justify-end flex-wrap">
          {showFilters && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    activeFilter === filter.id
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {rightSlot}

          {showSearch && (
            <div className={`relative w-full ${searchWidthClass} flex-shrink-0`}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9 h-9 text-sm rounded-lg bg-white border-gray-200"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageToolbar;
