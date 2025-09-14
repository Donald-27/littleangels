import { supabase } from '../lib/supabase';

class MpesaService {
  constructor() {
    this.consumerKey = import.meta.env.VITE_MPESA_CONSUMER_KEY || 'your_mpesa_consumer_key';
    this.consumerSecret = import.meta.env.VITE_MPESA_CONSUMER_SECRET || 'your_mpesa_consumer_secret';
    this.shortcode = import.meta.env.VITE_MPESA_SHORTCODE || 'your_mpesa_shortcode';
    this.passkey = import.meta.env.VITE_MPESA_PASSKEY || 'your_mpesa_passkey';
    this.baseUrl = 'https://sandbox.safaricom.co.ke'; // Use production URL for live
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token
  async getAccessToken() {
    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // Generate password for STK Push
  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${this.shortcode}${this.passkey}${timestamp}`);
    return { password, timestamp };
  }

  // Initiate STK Push payment
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      
      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${window.location.origin}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          responseDescription: data.ResponseDescription
        };
      } else {
        throw new Error(data.ResponseDescription || 'STK Push failed');
      }
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      throw error;
    }
  }

  // Query STK Push status
  async querySTKPushStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      
      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      return {
        success: data.ResponseCode === '0',
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID
      };
    } catch (error) {
      console.error('Error querying STK Push status:', error);
      throw error;
    }
  }

  // Process payment for transport fee
  async processTransportPayment(studentId, parentId, amount, phoneNumber) {
    try {
      // Create payment record
      const transactionId = `TXN${Date.now()}`;
      const accountReference = `LAS${studentId}`;
      const transactionDesc = `Transport fee for student ${studentId}`;

      // Initiate STK Push
      const stkResult = await this.initiateSTKPush(
        phoneNumber,
        amount,
        accountReference,
        transactionDesc
      );

      if (stkResult.success) {
        // Save payment record to database
        const { error } = await supabase
          .from('payments')
          .insert({
            transaction_id: transactionId,
            student_id: studentId,
            parent_id: parentId,
            amount: amount,
            currency: 'KES',
            description: transactionDesc,
            type: 'transport_fee',
            method: 'mpesa',
            status: 'pending',
            payment_details: {
              checkoutRequestId: stkResult.checkoutRequestId,
              merchantRequestId: stkResult.merchantRequestId,
              phoneNumber: phoneNumber,
              mpesaResponse: stkResult.responseDescription
            },
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            school_id: (await supabase.from('students').select('school_id').eq('id', studentId).single()).data.school_id
          });

        if (error) {
          console.error('Error saving payment record:', error);
          throw error;
        }

        return {
          success: true,
          transactionId,
          checkoutRequestId: stkResult.checkoutRequestId,
          message: 'Payment initiated successfully. Please check your phone for M-Pesa prompt.'
        };
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error processing transport payment:', error);
      throw error;
    }
  }

  // Handle M-Pesa callback
  async handleCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const stkCallback = Body.stkCallback;
      
      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata.Item;
        const amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

        // Update payment record
        const { error } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            paid_at: new Date().toISOString(),
            payment_details: {
              mpesaReceiptNumber: mpesaReceiptNumber,
              phoneNumber: phoneNumber,
              transactionDate: transactionDate,
              amount: amount
            }
          })
          .eq('payment_details->>checkoutRequestId', stkCallback.CheckoutRequestID);

        if (error) {
          console.error('Error updating payment record:', error);
          return { success: false, error: error.message };
        }

        // Send confirmation notification
        await this.sendPaymentConfirmation(stkCallback.CheckoutRequestID);

        return { success: true, message: 'Payment processed successfully' };
      } else {
        // Payment failed
        const { error } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            payment_details: {
              error: stkCallback.ResultDesc
            }
          })
          .eq('payment_details->>checkoutRequestId', stkCallback.CheckoutRequestID);

        if (error) {
          console.error('Error updating failed payment record:', error);
        }

        return { success: false, message: stkCallback.ResultDesc };
      }
    } catch (error) {
      console.error('Error handling M-Pesa callback:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment confirmation notification
  async sendPaymentConfirmation(checkoutRequestId) {
    try {
      // Get payment details
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          students(name, parent_id),
          users!payments_parent_id_fkey(email, name)
        `)
        .eq('payment_details->>checkoutRequestId', checkoutRequestId)
        .single();

      if (error || !payment) {
        console.error('Error fetching payment details:', error);
        return;
      }

      // Send notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          title: 'Payment Confirmation',
          message: `Your payment of KES ${payment.amount} for ${payment.description} has been received successfully.`,
          type: 'success',
          priority: 'medium',
          recipients: [payment.parent_id],
          channels: ['sms', 'email'],
          sent_by: payment.school_id, // System notification
          status: 'pending',
          related_entity: { type: 'payment', id: payment.id },
          school_id: payment.school_id
        });

      if (notifError) {
        console.error('Error sending payment confirmation:', notifError);
      }
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  // Get payment history for a student
  async getPaymentHistory(studentId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // Get pending payments
  async getPendingPayments(schoolId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students(name, student_id),
          users!payments_parent_id_fkey(name, phone)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending payments:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  }

  // Format phone number for M-Pesa
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // Validate phone number
  validatePhoneNumber(phoneNumber) {
    const cleaned = this.formatPhoneNumber(phoneNumber);
    return /^254[17]\d{8}$/.test(cleaned);
  }
}

// Create singleton instance
export const mpesaService = new MpesaService();
export default mpesaService;
