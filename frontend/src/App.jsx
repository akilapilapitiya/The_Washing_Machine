import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import Vehicles from './pages/Vehicles'
import Services from './pages/Services'
import Signup from './pages/Signup'
import CustomerLogin from './pages/CustomerLogin'
import EmployeeLogin from './pages/EmployeeLogin'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'
import ServiceSelectionPage from './features/booking/ServiceSelectionPage'
import LocationSelectionPage from './features/booking/LocationSelectionPage'
import EmployeeSelectionPage from './features/booking/EmployeeSelectionPage'
import DateTimeSelectionPage from './features/booking/DateTimeSelectionPage'
import BookingConfirmationPage from './features/booking/BookingConfirmationPage'
import ScheduledBookingsPage from './features/dashboard/ScheduledBookingsPage'
import ServiceHistoryPage from './features/dashboard/ServiceHistoryPage'
import PaymentHistoryPage from './features/dashboard/PaymentHistoryPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/book" element={<Booking />} />
          <Route path="booking/location" element={<LocationSelectionPage />} />
          <Route path="booking/services" element={<ServiceSelectionPage />} />
          <Route path="booking/employee" element={<EmployeeSelectionPage />} />
          <Route path="booking/datetime" element={<DateTimeSelectionPage />} />
          <Route path="booking/confirmation" element={<BookingConfirmationPage />} />
          <Route path="dashboard/bookings" element={<ScheduledBookingsPage />} />
          <Route path="dashboard/history" element={<ServiceHistoryPage />} />
          <Route path="dashboard/payments" element={<PaymentHistoryPage />} />
          <Route path="dashboard/vehicles" element={<Vehicles />} />
          <Route path="services" element={<Services />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<CustomerLogin />} />
          <Route path="employee/login" element={<EmployeeLogin />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App