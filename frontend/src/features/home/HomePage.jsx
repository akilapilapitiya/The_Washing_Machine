import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Footer from './Footer'

const HomePage = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to The Washing Machine</h1>
        <p className="text-lg text-gray-600 mb-8">Your home page content goes here</p>
        
        <div className="flex gap-4">
          <Link to="/dashboard">
            <Button size="lg">Sign Up</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </>
  )
}

export default HomePage
