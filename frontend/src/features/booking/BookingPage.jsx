import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import VehicleCard from './VehicleCard'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

// Temporary mock data; replace with API data later
const mockVehicles = [
  { id: '1', make: 'Toyota', model: 'Corolla', year: 2020, color: 'Blue', plate: 'ABC-123', nickname: 'Daily' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2019, color: 'White', plate: 'XYZ-789', nickname: 'Workhorse' },
  { id: '3', make: 'Ford', model: 'F-150', year: 2022, color: 'Gray', plate: 'TRK-555', nickname: 'Hauler' },
]

const BookingPage = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  const handleContinue = () => {
    // Next step will be scheduled after vehicle selection
    alert(`Proceeding with vehicle ID: ${selectedVehicleId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Book Service</p>
          <h1 className="text-3xl font-bold">Select a vehicle</h1>
          <p className="text-gray-600">Choose one of your registered vehicles to continue the booking.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={vehicle.id === selectedVehicleId}
              onSelect={setSelectedVehicleId}
            />
          ))}
          <Link
            to="/dashboard/vehicles"
            className="h-full"
          >
            <div className="h-full rounded-xl border border-dashed border-gray-300 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-sm">
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="flex items-center gap-3 text-blue-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <Plus size={18} />
                  </span>
                  <div>
                    <p className="text-base font-semibold">Add another vehicle</p>
                    <p className="text-sm text-gray-600">Save time at drop-off by registering your ride now.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <span>Go to vehicles</span>
                  <span aria-hidden="true">></span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Link to="/dashboard/vehicles">
            <Button variant="outline">Can't find your vehicle? Add it</Button>
          </Link>
          <Button
            onClick={handleContinue}
            disabled={!selectedVehicleId}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
