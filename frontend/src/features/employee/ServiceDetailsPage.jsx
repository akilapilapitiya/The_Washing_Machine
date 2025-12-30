import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, MapPin, Car, Wrench, User, Phone, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

// Mock data - same as in AssignedServicesPage
const mockAssignedServices = [
  {
    id: '1',
    bookingId: 'BK-2025-001',
    status: 'scheduled',
    date: '2025-12-31',
    time: '10:00 AM',
    customer: { name: 'John Doe', phone: '+94 77 123 4567', email: 'john.doe@example.com' },
    vehicle: { brand: 'Toyota', model: 'Corolla', plate: 'ABC-123', nickname: 'Daily', currentMileage: '45,000', color: 'Blue', year: 2020 },
    services: ['Exterior Wash', 'Interior Detailing'],
    location: 'Main Branch - Pannipitiya',
    estimatedDuration: '90 mins',
    totalCost: '$80',
  },
  {
    id: '2',
    bookingId: 'BK-2025-002',
    status: 'in-progress',
    date: '2025-12-30',
    time: '2:00 PM',
    customer: { name: 'Sarah Smith', phone: '+94 77 987 6543', email: 'sarah.smith@example.com' },
    vehicle: { brand: 'Honda', model: 'Civic', plate: 'XYZ-789', nickname: 'Workhorse', currentMileage: '62,000', color: 'White', year: 2019 },
    services: ['Full Service Detail'],
    location: 'Home Visit',
    estimatedDuration: '180 mins',
    totalCost: '$120',
  },
]

const ServiceDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const service = mockAssignedServices.find(s => s.id === id)
  
  const [status, setStatus] = useState(service?.status || 'scheduled')
  const [currentMileage, setCurrentMileage] = useState(service?.vehicle.currentMileage || '')
  const [nextServiceMileage, setNextServiceMileage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Service not found</h3>
            <p className="text-gray-600 mb-4">The requested service could not be found.</p>
            <Button onClick={() => navigate('/dashboard/employee/assigned')}>
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleUpdateMileage = () => {
    // In real app, this would make an API call
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Service Details</p>
          <h1 className="text-3xl font-bold">{service.bookingId}</h1>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">Changes saved successfully!</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{service.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold flex items-center gap-2">
                  <Phone size={14} />
                  {service.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{service.customer.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car size={20} className="text-blue-600" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-semibold">
                  {service.vehicle.nickname || `${service.vehicle.brand} ${service.vehicle.model}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Plate</p>
                  <p className="font-semibold">{service.vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-semibold">{service.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Color</p>
                  <p className="font-semibold">{service.vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Mileage</p>
                  <p className="font-semibold">{service.vehicle.currentMileage} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="font-semibold">{formatDate(service.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className="font-semibold">{service.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="font-semibold">{service.location}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="font-semibold">{service.estimatedDuration}</p>
              </div>
            </CardContent>
          </Card>

          {/* Services & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench size={20} className="text-blue-600" />
                Services & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Services</p>
                <ul className="space-y-1">
                  {service.services.map((srv, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      {srv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Cost</p>
                <p className="text-xl font-bold text-blue-600">{service.totalCost}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={status === 'scheduled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('scheduled')}
                  >
                    Scheduled
                  </Button>
                  <Button
                    variant={status === 'in-progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('in-progress')}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mileage Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car size={20} className="text-blue-600" />
              Mileage Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="currentMileage">Update Current Mileage (km)</Label>
                <div className="flex gap-2">
                  <Input
                    id="currentMileage"
                    type="text"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    placeholder="e.g., 45,500"
                  />
                  <Button onClick={handleUpdateMileage}>Update</Button>
                </div>
                <p className="text-sm text-gray-500">Current: {service.vehicle.currentMileage} km</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="nextService">Suggest Next Service At (km)</Label>
                <div className="flex gap-2">
                  <Input
                    id="nextService"
                    type="text"
                    value={nextServiceMileage}
                    onChange={(e) => setNextServiceMileage(e.target.value)}
                    placeholder="e.g., 50,000"
                  />
                  <Button onClick={handleUpdateMileage}>Save</Button>
                </div>
                <p className="text-sm text-gray-500">Recommend when customer should return for next service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ServiceDetailsPage
