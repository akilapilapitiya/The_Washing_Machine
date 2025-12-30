import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wrench, Plus, Trash2, Edit, X, CheckCircle, DollarSign, Clock } from 'lucide-react'

// Mock services data
const mockServices = [
  {
    id: '1',
    title: 'Exterior Wash',
    description: 'Thorough exterior wash, rinse, and dry with premium products.',
    price: 20,
    duration: '20-30 mins',
    category: 'Washing',
  },
  {
    id: '2',
    title: 'Interior Detailing',
    description: 'Deep interior clean including vacuum, wipe-down, and window care.',
    price: 60,
    duration: '45-60 mins',
    category: 'Detailing',
  },
  {
    id: '3',
    title: 'Full Service Detail',
    description: 'Complete inside-out detailing for a showroom finish.',
    price: 120,
    duration: '2-3 hrs',
    category: 'Detailing',
  },
  {
    id: '4',
    title: 'Oil Change',
    description: 'Quality oil and filter change with multi-point inspection.',
    price: 50,
    duration: '30-45 mins',
    category: 'Maintenance',
  },
  {
    id: '5',
    title: 'Tire & Wheel Care',
    description: 'Tire shine, wheel clean, and pressure check.',
    price: 25,
    duration: '20-30 mins',
    category: 'Maintenance',
  },
  {
    id: '6',
    title: 'Engine Bay Clean',
    description: 'Gentle degrease and clean for a fresh engine bay.',
    price: 70,
    duration: '45-60 mins',
    category: 'Cleaning',
  },
]

const categories = ['Washing', 'Detailing', 'Maintenance', 'Cleaning', 'Repair', 'Other']

const ManageServicesPage = () => {
  const [services, setServices] = useState(mockServices)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'Washing',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      duration: '',
      category: 'Washing',
    })
  }

  const handleAddService = (e) => {
    e.preventDefault()

    const newService = {
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
    }

    setServices([...services, newService])
    resetForm()
    setShowAddForm(false)
    setSuccessMessage('Service added successfully!')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleEditService = (e) => {
    e.preventDefault()

    const updatedServices = services.map(service =>
      service.id === selectedService.id
        ? { ...service, ...formData, price: parseFloat(formData.price) }
        : service
    )

    setServices(updatedServices)
    resetForm()
    setShowEditForm(false)
    setSelectedService(null)
    setSuccessMessage('Service updated successfully!')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      setServices(services.filter(service => service.id !== id))
      setSuccessMessage('Service deleted successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const openEditForm = (service) => {
    setSelectedService(service)
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      category: service.category,
    })
    setShowEditForm(true)
  }

  const openAddForm = () => {
    resetForm()
    setShowAddForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Service Management</p>
            <h1 className="text-3xl font-bold">Manage Services</h1>
            <p className="text-gray-600">Add, edit, and manage all available services.</p>
          </div>
          <Button onClick={openAddForm} className="flex items-center gap-2">
            <Plus size={18} />
            Add Service
          </Button>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{services.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Services</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{services.filter(s => s.category === 'Washing').length}</p>
                <p className="text-sm text-gray-600 mt-1">Washing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{services.filter(s => s.category === 'Detailing').length}</p>
                <p className="text-sm text-gray-600 mt-1">Detailing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{services.filter(s => s.category === 'Maintenance').length}</p>
                <p className="text-sm text-gray-600 mt-1">Maintenance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {service.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Delete service"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="font-semibold text-green-600">Starting at ${service.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-gray-700">Approx. {service.duration}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(service)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Edit Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">Add your first service to get started.</p>
              <Button onClick={openAddForm}>
                <Plus size={18} className="mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" />
                  Add New Service
                </CardTitle>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Exterior Wash"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 20-30 mins"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Service</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit size={20} className="text-blue-600" />
                  Edit Service
                </CardTitle>
                <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Service Title *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Exterior Wash"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price ($) *</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration *</Label>
                    <Input
                      id="edit-duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 20-30 mins"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <select
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Service</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ManageServicesPage
