import React from 'react'
import ServiceCard from './ServiceCard'

const services = [
  {
    title: 'Exterior Wash',
    description: 'Thorough exterior wash, rinse, and dry with premium products.',
    price: '$20',
    duration: '20-30 mins',
  },
  {
    title: 'Interior Detailing',
    description: 'Deep interior clean including vacuum, wipe-down, and window care.',
    price: '$60',
    duration: '45-60 mins',
  },
  {
    title: 'Full Service Detail',
    description: 'Complete inside-out detailing for a showroom finish.',
    price: '$120',
    duration: '2-3 hrs',
  },
  {
    title: 'Oil Change',
    description: 'Quality oil and filter change with multi-point inspection.',
    price: '$50',
    duration: '30-45 mins',
  },
  {
    title: 'Tire & Wheel Care',
    description: 'Tire shine, wheel clean, and pressure check.',
    price: '$25',
    duration: '20-30 mins',
  },
  {
    title: 'Engine Bay Clean',
    description: 'Gentle degrease and clean for a fresh engine bay.',
    price: '$70',
    duration: '45-60 mins',
  },
]

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mb-10">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Our Services</p>
          <h1 className="text-4xl font-bold mb-3">Vehicle care, done right</h1>
          <p className="text-gray-600">
            Choose from our curated set of services tailored to keep your vehicle looking sharp and running smoothly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServicesPage
