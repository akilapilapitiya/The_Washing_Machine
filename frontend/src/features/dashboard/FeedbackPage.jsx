import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Calendar, Car, Send, CheckCircle } from 'lucide-react'

// Mock completed services that user can give feedback on
const mockCompletedServices = [
  {
    id: '1',
    date: '2025-12-28',
    vehicle: { brand: 'Ford', model: 'F-150', plate: 'TRK-555', nickname: 'Hauler' },
    services: ['Oil Change', 'Tire & Wheel Care'],
    location: 'Main Branch - Pannipitiya',
  },
  {
    id: '2',
    date: '2025-12-15',
    vehicle: { brand: 'Toyota', model: 'Corolla', plate: 'ABC-123', nickname: 'Daily' },
    services: ['Exterior Wash', 'Interior Detailing'],
    location: 'Main Branch - Pannipitiya',
  },
  {
    id: '3',
    date: '2025-12-05',
    vehicle: { brand: 'Honda', model: 'Civic', plate: 'XYZ-789', nickname: 'Workhorse' },
    services: ['Full Service Detail'],
    location: 'Home Visit',
  },
]

// Mock previous feedbacks
const mockPreviousFeedbacks = [
  {
    id: '1',
    serviceId: '2',
    date: '2025-12-16',
    service: {
      vehicle: { brand: 'Toyota', model: 'Corolla', plate: 'ABC-123', nickname: 'Daily' },
      services: ['Exterior Wash', 'Interior Detailing'],
      serviceDate: '2025-12-15',
    },
    feedback: 'Excellent service! The team was very professional and my car looks brand new. Will definitely come back.',
    rating: 5,
  },
  {
    id: '2',
    serviceId: '3',
    date: '2025-12-06',
    service: {
      vehicle: { brand: 'Honda', model: 'Civic', plate: 'XYZ-789', nickname: 'Workhorse' },
      services: ['Full Service Detail'],
      serviceDate: '2025-12-05',
    },
    feedback: 'Great attention to detail. The home visit service was very convenient. Minor delay but overall satisfied.',
    rating: 4,
  },
]

const FeedbackPage = () => {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState(mockPreviousFeedbacks)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    
    if (!selectedServiceId || !feedbackText.trim()) {
      return
    }

    const selectedService = mockCompletedServices.find(s => s.id === selectedServiceId)
    
    const newFeedback = {
      id: Date.now().toString(),
      serviceId: selectedServiceId,
      date: new Date().toISOString().split('T')[0],
      service: {
        vehicle: selectedService.vehicle,
        services: selectedService.services,
        serviceDate: selectedService.date,
      },
      feedback: feedbackText,
      rating: 5,
    }

    setSubmittedFeedbacks(prev => [newFeedback, ...prev])
    setSelectedServiceId('')
    setFeedbackText('')
    setShowSuccess(true)
    
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Feedback</p>
          <h1 className="text-3xl font-bold">Share your experience</h1>
          <p className="text-gray-600">Help us improve by sharing your feedback on our services.</p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">Thank you for your feedback!</p>
          </div>
        )}

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            <TabsTrigger value="previous">Previous Feedback ({submittedFeedbacks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-600" />
                  New Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="service">Select Service *</Label>
                    <select
                      id="service"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Choose a completed service --</option>
                      {mockCompletedServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {formatDate(service.date)} - {service.vehicle.nickname || `${service.vehicle.brand} ${service.vehicle.model}`} ({service.vehicle.plate}) - {service.services.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="feedback">Your Feedback *</Label>
                    <textarea
                      id="feedback"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your experience with us... What did you like? What could we improve?"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                    />
                    <p className="text-sm text-gray-500">{feedbackText.length} characters</p>
                  </div>

                  <Button type="submit" className="flex items-center gap-2">
                    <Send size={18} />
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previous" className="space-y-4">
            {submittedFeedbacks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {submittedFeedbacks.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardHeader>
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {feedback.service.vehicle.nickname || `${feedback.service.vehicle.brand} ${feedback.service.vehicle.model}`}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{feedback.service.vehicle.plate}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Service: {formatDate(feedback.service.serviceDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Services:</p>
                        <p className="text-sm text-gray-600">{feedback.service.services.join(', ')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Your Feedback:</p>
                        <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {feedback.feedback}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500">Submitted on {formatDate(feedback.date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                  <p className="text-gray-600">Your submitted feedback will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default FeedbackPage
