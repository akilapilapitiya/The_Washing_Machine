import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

const locations = [
  {
    id: 'main-branch',
    title: 'The Washing Machine - Main Branch',
    type: 'branch',
    address: 'Pannipitiya, Colombo, Sri Lanka',
    icon: MapPin,
    description: 'Visit our main service center with full facilities and expert staff.',
  },
  {
    id: 'home-visit',
    title: 'Home Visit',
    type: 'home',
    address: 'We come to you',
    icon: Home,
    description: 'Our team will visit your location for convenient on-site service.',
  },
]

const LocationSelectionPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedLocationId, setSelectedLocationId] = useState(null)

  const { vehicleId, serviceIds } = location.state || {}

  const handleContinue = () => {
    // Navigate to employee selection with all booking data
    navigate('/booking/employee', { 
      state: { vehicleId, serviceIds, locationId: selectedLocationId } 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Book Service</p>
          <h1 className="text-3xl font-bold">Select location</h1>
          <p className="text-gray-600">Choose where you'd like to receive your service.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
          {locations.map((loc) => {
            const Icon = loc.icon
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className="text-left"
                aria-pressed={selectedLocationId === loc.id}
              >
                <Card
                  className={cn(
                    'h-full border transition hover:border-blue-400 hover:shadow-sm',
                    selectedLocationId === loc.id && 'border-blue-500 shadow ring-2 ring-blue-500 ring-offset-0'
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-lg">
                      <span className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Icon size={20} />
                      </span>
                      <div className="flex-1">
                        <div>{loc.title}</div>
                        <div className="text-sm font-normal text-gray-600 mt-1">{loc.address}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{loc.description}</p>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedLocationId}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LocationSelectionPage
