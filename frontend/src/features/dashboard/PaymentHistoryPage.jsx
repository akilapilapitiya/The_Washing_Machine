import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Car, CreditCard, FileText, CheckCircle, DollarSign } from 'lucide-react'

// Mock payment history data
const mockPaymentHistory = [
  {
    id: '1',
    transactionId: 'TXN-2025-001',
    date: '2025-12-28',
    vehicle: { brand: 'Ford', model: 'F-150', plate: 'TRK-555', nickname: 'Hauler' },
    services: ['Oil Change', 'Tire & Wheel Care'],
    paymentMethod: 'Credit Card',
    amount: '$75',
    status: 'paid',
  },
  {
    id: '2',
    transactionId: 'TXN-2025-002',
    date: '2025-12-15',
    vehicle: { brand: 'Toyota', model: 'Corolla', plate: 'ABC-123', nickname: 'Daily' },
    services: ['Exterior Wash', 'Interior Detailing'],
    paymentMethod: 'Debit Card',
    amount: '$80',
    status: 'paid',
  },
  {
    id: '3',
    transactionId: 'TXN-2025-003',
    date: '2025-12-05',
    vehicle: { brand: 'Honda', model: 'Civic', plate: 'XYZ-789', nickname: 'Workhorse' },
    services: ['Full Service Detail'],
    paymentMethod: 'Cash',
    amount: '$120',
    status: 'paid',
  },
  {
    id: '4',
    transactionId: 'TXN-2025-004',
    date: '2025-11-20',
    vehicle: { brand: 'Toyota', model: 'Corolla', plate: 'ABC-123', nickname: 'Daily' },
    services: ['Engine Bay Clean', 'Exterior Wash'],
    paymentMethod: 'Credit Card',
    amount: '$90',
    status: 'paid',
  },
]

const PaymentHistoryCard = ({ payment }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {payment.vehicle.nickname || `${payment.vehicle.brand} ${payment.vehicle.model}`}
            </CardTitle>
            <p className="text-sm text-gray-600">{payment.vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle size={12} />
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <FileText size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-gray-500">Transaction ID</span>
              <p className="text-gray-800 font-mono text-xs">{payment.transactionId}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Calendar size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{formatDate(payment.date)}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CreditCard size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{payment.paymentMethod}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <DollarSign size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{payment.services.join(', ')}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-600">Amount Paid</span>
          <span className="text-lg font-bold text-blue-600">{payment.amount}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const PaymentHistoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Payment History</p>
          <h1 className="text-3xl font-bold">Your payment history</h1>
          <p className="text-gray-600">View all receipts and transaction records.</p>
        </div>

        {mockPaymentHistory.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPaymentHistory.map((payment) => (
              <PaymentHistoryCard key={payment.id} payment={payment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payment history</h3>
              <p className="text-gray-600">Your payment records will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PaymentHistoryPage
