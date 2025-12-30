import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        <Outlet />
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>&copy; 2025 The Washing Machine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
