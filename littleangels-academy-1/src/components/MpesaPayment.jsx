import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mpesaService } from '../services/mpesaService';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  RefreshCw,
  Phone,
  DollarSign
} from 'lucide-react';

const MpesaPayment = ({ studentId, onPaymentComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(5000);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadPaymentHistory();
      loadPendingPayments();
    }
  }, [studentId]);

  useEffect(() => {
    setIsValidPhone(mpesaService.validatePhoneNumber(phoneNumber));
  }, [phoneNumber]);

  const loadPaymentHistory = async () => {
    try {
      const history = await mpesaService.getPaymentHistory(studentId);
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const loadPendingPayments = async () => {
    try {
      const pending = await mpesaService.getPendingPayments(user.school_id);
      setPendingPayments(pending.filter(p => p.student_id === studentId));
    } catch (error) {
      console.error('Error loading pending payments:', error);
    }
  };

  const handlePayment = async () => {
    if (!isValidPhone) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      const result = await mpesaService.processTransportPayment(
        studentId,
        user.id,
        amount,
        phoneNumber
      );

      if (result.success) {
        toast.success(result.message);
        loadPaymentHistory();
        loadPendingPayments();
        if (onPaymentComplete) {
          onPaymentComplete(result);
        }
      } else {
        toast.error('Payment initiation failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    return mpesaService.formatPhoneNumber(phone);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            M-Pesa Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`pl-10 ${!isValidPhone && phoneNumber ? 'border-red-300' : ''}`}
                />
              </div>
              {phoneNumber && !isValidPhone && (
                <p className="text-sm text-red-600 mt-1">
                  Please enter a valid Kenyan phone number
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KES)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enter your M-Pesa registered phone number</li>
                  <li>You will receive an M-Pesa prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to complete the payment</li>
                  <li>You will receive a confirmation SMS</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading || !isValidPhone || amount <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Pay with M-Pesa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{payment.description}</p>
                    <p className="text-sm text-gray-600">
                      Amount: {formatCurrency(payment.amount)} | 
                      Phone: {payment.payment_details?.phoneNumber || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment History
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPaymentHistory}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Amount:</span> {formatCurrency(payment.amount)}
                      </div>
                      <div>
                        <span className="font-medium">Method:</span> {payment.method.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {formatDate(payment.created_at)}
                      </div>
                    </div>
                    {payment.payment_details?.mpesaReceiptNumber && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Receipt:</span> {payment.payment_details.mpesaReceiptNumber}
                      </div>
                    )}
                  </div>
                  {payment.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-500">No payments have been made yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {paymentHistory.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-green-800">Completed Payments</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {paymentHistory.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-800">Pending Payments</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm text-blue-800">Total Paid</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaPayment;
