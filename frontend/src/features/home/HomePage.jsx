import React from 'react'
import Footer from './Footer'

const HomePage = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to The Washing Machine</h1>
        <p className="text-lg text-gray-600">Your home page content goes here</p>
      </div>
      
      <Footer />
    </>
  )
}

export default HomePage
