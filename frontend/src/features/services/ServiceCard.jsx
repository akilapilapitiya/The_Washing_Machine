import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ServiceCard = ({ title, description, price, duration }) => {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{description}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-blue-600">Starting at {price}</span>
          <span className="text-gray-500">Approx. {duration}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceCard
