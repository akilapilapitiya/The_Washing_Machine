import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Layers, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";

const AddonsSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  const vehicleId = location.state?.vehicleId;
  const selectedPackageId = location.state?.selectedPackageId; // null means add-ons only mode

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
  }, [vehicleId, selectedPackageId, navigate]);

  const addons = useMemo(
    () => services.filter((s) => s.servicetype === "addon"),
    [services],
  );

  // Filter by search and price
  const filteredAddons = useMemo(() => {
    let filtered = addons;

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
  }, [addons, searchQuery, priceFilter, showOffersOnly]);

  const handleSelectAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  const isMainServiceSelected = Boolean(selectedPackageId);
  const canProceedFromAddons =
    isMainServiceSelected || selectedAddonIds.length > 0;

  const handleContinue = useCallback(() => {
    if (!canProceedFromAddons) {
      toast.error(
        "Select at least one add-on when no main service is selected.",
      );
      return;
    }

    const serviceIds = selectedPackageId
      ? [selectedPackageId, ...selectedAddonIds]
      : [...selectedAddonIds];
    navigate("/dashboard/booking/location", {
      state: { vehicleId, serviceIds },
    });
  }, [
    canProceedFromAddons,
    navigate,
    selectedPackageId,
    selectedAddonIds,
    vehicleId,
  ]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Toolbar with search and filters
  const searchToolbar = useMemo(
    () => (
      <BookingFlowToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search add-ons..."
        meta={
          !isMainServiceSelected && !canProceedFromAddons ? (
            <span className="text-xs font-medium text-red-600 whitespace-nowrap">
              Select at least 1 add-on to continue
            </span>
          ) : null
        }
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
            <BookingToolbarActionButton
              onClick={handleContinue}
              disabled={!canProceedFromAddons}
            >
              <span>Next</span>
              <ArrowRight size={14} className="ml-2" />
            </BookingToolbarActionButton>
          </>
        }
      />
    ),
    [
      searchQuery,
      priceFilter,
      showOffersOnly,
      isMainServiceSelected,
      canProceedFromAddons,
      handleBack,
      handleContinue,
    ],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Add-ons",
    "Enhance your booking with optional add-on services.",
    null,
    searchToolbar,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading available add-ons...</p>
        </div>
      </div>
    );
  }

  const AddonRow = ({ service, isSelected, onSelect }) => {
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
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(service.serviceid)}
            className="w-4 h-4 text-red-600 cursor-pointer accent-red-600 rounded"
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
            <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
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
        {filteredAddons.length > 0 ? (
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-8"></th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Add-on
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
                    {filteredAddons.map((service) => (
                      <AddonRow
                        key={service.serviceid}
                        service={service}
                        isSelected={selectedAddonIds.includes(
                          service.serviceid,
                        )}
                        onSelect={handleSelectAddon}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {addons.length === 0
                  ? "No add-ons available."
                  : "No add-ons match your filters."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddonsSelectionPage;
