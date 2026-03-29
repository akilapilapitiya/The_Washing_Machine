import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Car, ArrowRight, Search, Plus } from "lucide-react";
import * as vehicleService from "@/services/vehicle.service";
import { Card, CardContent } from "@/components/ui/card";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";
import { toast } from "sonner";

const BookingPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const vehiclesData = await vehicleService.getVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      toast.error(err.message || "Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Transform vehicles for table - add computed fields
  const tableData = useMemo(() => {
    return vehicles.map((v) => ({
      ...v,
      displayName: v.vehicleNickname || `${v.vehbrand} ${v.vehmodel}`,
      make: v.vehbrand,
      model: v.vehmodel,
      year: v.manufacture_year,
      fuel: v.fuel_type,
      transmission: v.transmission,
    }));
  }, [vehicles]);

  // Handle continue button click
  const handleContinue = useCallback(() => {
    navigate("/dashboard/booking/services", {
      state: { vehicleId: selectedVehicleId },
    });
  }, [navigate, selectedVehicleId]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle row selection click
  const handleRowClick = (vehicle) => {
    setSelectedVehicleId(selectedVehicleId === vehicle.id ? null : vehicle.id);
  };

  // Header action button - Manage Garage
  const headerAction = useMemo(
    () => (
      <Link to="/dashboard/vehicles">
        <Button
          variant="outline"
          className="px-6 h-10 font-medium text-gray-700 border-gray-300"
        >
          Manage Garage
        </Button>
      </Link>
    ),
    [],
  );

  // Search toolbar component with Continue button
  const searchToolbar = useMemo(
    () => (
      <BookingFlowToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vehicles..."
        meta={
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {tableData.length} vehicle{tableData.length !== 1 ? "s" : ""}
          </span>
        }
        rightSlot={
          <>
            <BookingToolbarBackButton onClick={handleBack} />
            <BookingToolbarActionButton
              onClick={handleContinue}
              disabled={!selectedVehicleId}
              className="px-8"
            >
              <span>Continue</span>
              <ArrowRight size={14} className="ml-2" />
            </BookingToolbarActionButton>
          </>
        }
      />
    ),
    [
      searchQuery,
      tableData.length,
      handleBack,
      handleContinue,
      selectedVehicleId,
    ],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Vehicle",
    "Choose one of your registered vehicles to continue.",
    headerAction,
    searchToolbar,
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-600" />
              <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">
              Loading vehicles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border border-dashed border-gray-200 bg-white shadow-none">
          <CardContent className="text-center py-12 space-y-4">
            <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Car size={24} className="text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                No Vehicles Found
              </p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                You don't have any vehicles registered yet. Add one to get
                started.
              </p>
            </div>
            <Link to="/dashboard/vehicles" className="inline-block mt-2">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 h-10 shadow-sm">
                <Plus size={18} className="mr-2" />
                Add Vehicle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Vehicle Selection Table */}
      <DataTable
        columns={[
          {
            key: "displayName",
            label: "Vehicle",
            render: (row) => (
              <button
                onClick={() => handleRowClick(row)}
                className="text-left hover:text-red-600 transition-colors font-medium flex items-center gap-2"
              >
                <div
                  className={`flex-shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                    selectedVehicleId === row.id
                      ? "bg-red-600 border-red-600"
                      : "border-gray-300 hover:border-red-400"
                  }`}
                >
                  {selectedVehicleId === row.id && (
                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900">{row.displayName}</span>
              </button>
            ),
          },
          {
            key: "vehplate",
            label: "Plate",
            className: "text-gray-600 font-mono text-sm",
            render: (row) => (
              <span className="font-mono uppercase bg-gray-100 px-2 py-1 rounded text-xs">
                {row.vehplate}
              </span>
            ),
          },
          {
            key: "make",
            label: "Make & Model",
            className: "text-gray-600 text-sm",
            render: (row) => `${row.make} ${row.model}`,
          },
          {
            key: "year",
            label: "Year",
            className: "text-gray-600 text-sm",
          },
          {
            key: "fuel",
            label: "Fuel Type",
            className: "text-gray-600 text-sm uppercase",
            render: (row) => row.fuel || "—",
          },
          {
            key: "transmission",
            label: "Transmission",
            className: "text-gray-600 text-sm uppercase",
            render: (row) => row.transmission || "—",
          },
        ]}
        data={tableData}
        keyField="id"
        emptyTitle="No vehicles match your search"
        emptySubtitle="Try adjusting your search query"
        emptyIcon={Search}
      />
    </div>
  );
};

export default BookingPage;
