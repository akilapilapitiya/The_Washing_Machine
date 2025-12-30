import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">The Washing Machine</h1>
        </div>
      </header>
      
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
