import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

// Mock vehicles for reference
const mockVehicles = [
  { id: '1', make: 'Toyota', model: 'Corolla', year: 2020, color: 'Blue', plate: 'ABC-123', nickname: 'Daily' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2019, color: 'White', plate: 'XYZ-789', nickname: 'Workhorse' },
  { id: '3', make: 'Ford', model: 'F-150', year: 2022, color: 'Gray', plate: 'TRK-555', nickname: 'Hauler' },
]

// Mock services data; replace with API data later
const mockServices = [
  {
    id: '1',
    title: 'Exterior Wash',
    description: 'Thorough exterior wash, rinse, and dry with premium products.',
    price: '$20',
    duration: '20-30 mins',
  },
  {
    id: '2',
    title: 'Interior Detailing',
    description: 'Deep interior clean including vacuum, wipe-down, and window care.',
    price: '$60',
    duration: '45-60 mins',
  },
  {
    id: '3',
    title: 'Full Service Detail',
    description: 'Complete inside-out detailing for a showroom finish.',
    price: '$120',
    duration: '2-3 hrs',
  },
  {
    id: '4',
    title: 'Oil Change',
    description: 'Quality oil and filter change with multi-point inspection.',
    price: '$50',
    duration: '30-45 mins',
  },
  {
    id: '5',
    title: 'Tire & Wheel Care',
    description: 'Tire shine, wheel clean, and pressure check.',
    price: '$25',
    duration: '20-30 mins',
  },
  {
    id: '6',
    title: 'Engine Bay Clean',
    description: 'Gentle degrease and clean for a fresh engine bay.',
    price: '$70',
    duration: '45-60 mins',
  },
]

const ServiceSelectionPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedServiceIds, setSelectedServiceIds] = useState([])

  const vehicleId = location.state?.vehicleId
  const selectedVehicle = mockVehicles.find((v) => v.id === vehicleId)

  const handleSelectService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleContinue = () => {
    // Navigate to location selection with vehicle and services
    navigate('/booking/location', { state: { vehicleId, serviceIds: selectedServiceIds } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Book Service</p>
          <h1 className="text-3xl font-bold">Select services</h1>
          <p className="text-gray-600">Choose one or more services you'd like for your vehicle.</p>
        </div>

        {selectedVehicle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Selected Vehicle</p>
            <p className="text-lg font-semibold text-gray-800">
              {selectedVehicle.nickname || `${selectedVehicle.make} ${selectedVehicle.model}`}
            </p>
            <p className="text-sm text-gray-600">
              {selectedVehicle.year} • {selectedVehicle.color} • {selectedVehicle.plate}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockServices.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelectService(service.id)}
              className="text-left"
              aria-pressed={selectedServiceIds.includes(service.id)}
            >
              <Card
                className={cn(
                  'h-full border transition hover:border-blue-400 hover:shadow-sm',
                  selectedServiceIds.includes(service.id) && 'border-blue-500 shadow ring-2 ring-blue-500 ring-offset-0'
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{service.title}</span>
                    {selectedServiceIds.includes(service.id) && (
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check size={16} />
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-blue-600">Starting at {service.price}</span>
                    <span className="text-gray-500">Approx. {service.duration}</span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Button
            onClick={handleContinue}
            disabled={selectedServiceIds.length === 0}
          >
            Continue with {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'service' : 'services'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServiceSelectionPage
