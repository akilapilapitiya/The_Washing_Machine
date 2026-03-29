import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Box, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";

const ServiceSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  // "addons-only" is a frontend-only sentinel meaning no main package needed
  const [selectedPackageId, setSelectedPackageId] = useState("addons-only");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  const vehicleId = location.state?.vehicleId;

  useEffect(() => {
    if (!vehicleId) {
      navigate("/dashboard/book");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        toast.dismiss();
        const servicesData = await serviceService.getServices();
        setServices(servicesData);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        toast.error("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, navigate]);

  const packages = useMemo(
    () => services.filter((s) => !s.servicetype || s.servicetype === "package"),
    [services],
  );

  // Filter by search and price
  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.servicename.toLowerCase().includes(query) ||
          (s.short_description || "").toLowerCase().includes(query) ||
          (s.servicedetails || "").toLowerCase().includes(query),
      );
    }

    // Price filter
    const maxPrice = priceFilter === "all" ? Infinity : parseInt(priceFilter);
    filtered = filtered.filter((s) => {
      const price = s.has_offer ? s.offer_price : s.serviceprice;
      return parseFloat(price) <= maxPrice;
    });

    // Offers filter
    if (showOffersOnly) {
      filtered = filtered.filter((s) => s.has_offer);
    }

    return filtered;
  }, [packages, searchQuery, priceFilter, showOffersOnly]);

  const handleSelectPackage = (packageId) => {
    setSelectedPackageId(
      selectedPackageId === packageId ? "addons-only" : packageId,
    );
  };

  const handleContinue = useCallback(() => {
    navigate("/dashboard/booking/addons", {
      state: {
        vehicleId,
        // Pass null if add-ons only so downstream knows no main package
        selectedPackageId:
          selectedPackageId === "addons-only" ? null : selectedPackageId,
      },
    });
  }, [navigate, vehicleId, selectedPackageId]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Toolbar with search and filters
  const searchToolbar = useMemo(
    () => (
      <BookingFlowToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search services..."
        centerSlot={
          <>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-0"
            >
              <option value="all">All Prices</option>
              <option value="5000">Up to Rs. 5,000</option>
              <option value="10000">Up to Rs. 10,000</option>
              <option value="20000">Up to Rs. 20,000</option>
              <option value="50000">Up to Rs. 50,000</option>
            </select>

            <button
              onClick={() => setShowOffersOnly(!showOffersOnly)}
              className={cn(
                "h-9 px-3 text-sm font-medium rounded-md border transition-colors flex items-center gap-2",
                showOffersOnly
                  ? "bg-red-100 border-red-300 text-red-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              )}
            >
              <Zap size={14} />
              Offers
            </button>
          </>
        }
        rightSlot={
          <>
            <BookingToolbarBackButton onClick={handleBack} />
            <BookingToolbarActionButton onClick={handleContinue}>
              <span>Next</span>
              <ArrowRight size={14} className="ml-2" />
            </BookingToolbarActionButton>
          </>
        }
      />
    ),
    [searchQuery, priceFilter, showOffersOnly, handleBack, handleContinue],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Service Package",
    "Choose the main service package for your booking.",
    null,
    searchToolbar,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading available services...</p>
        </div>
      </div>
    );
  }

  const ServiceRow = ({ service, isSelected, onSelect }) => {
    const price = service.has_offer
      ? service.offer_price
      : service.serviceprice;
    const displayPrice = parseFloat(price).toLocaleString();
    const originalPrice = service.has_offer
      ? parseFloat(service.serviceprice).toLocaleString()
      : null;

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 w-8">
          <input
            type="radio"
            checked={isSelected}
            onChange={() => onSelect(service.serviceid)}
            className="w-4 h-4 text-red-600 cursor-pointer accent-red-600"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900">
              {service.servicename}
            </span>
            <span className="text-xs text-gray-500 line-clamp-1">
              {service.short_description || service.servicedetails}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {service.servicetime}m
        </td>
        <td className="px-4 py-3">
          {service.has_offer && (
            <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded mb-1 block">
              OFFER
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {originalPrice ? (
            <div className="flex flex-col items-end gap-1">
              <span className="line-through text-gray-400 text-xs">
                Rs. {originalPrice}
              </span>
              <span className="font-bold text-red-600">Rs. {displayPrice}</span>
            </div>
          ) : (
            <span className="font-bold text-gray-900">Rs. {displayPrice}</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-8"></th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add-ons Only option — always visible, not affected by filters */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 w-8">
                      <input
                        type="radio"
                        checked={selectedPackageId === "addons-only"}
                        onChange={() => setSelectedPackageId("addons-only")}
                        className="w-4 h-4 text-red-600 cursor-pointer accent-red-600"
                      />
                    </td>
                    <td className="px-4 py-3" colSpan={3}>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">
                          Add-ons Only
                        </span>
                        <span className="text-xs text-gray-500">
                          Skip the main package — proceed with add-ons only
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-gray-400">
                        —
                      </span>
                    </td>
                  </tr>

                  {filteredPackages.map((service) => (
                    <ServiceRow
                      key={service.serviceid}
                      service={service}
                      isSelected={selectedPackageId === service.serviceid}
                      onSelect={handleSelectPackage}
                    />
                  ))}

                  {filteredPackages.length === 0 && packages.length > 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-gray-400"
                      >
                        No packages match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
