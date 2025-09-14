import { supabase } from '../lib/supabase';

class NotificationService {
  constructor() {
    this.smsApiKey = import.meta.env.VITE_SMS_API_KEY;
    this.senderId = import.meta.env.VITE_SMS_SENDER_ID || 'LittleAngels';
    this.emailFrom = import.meta.env.VITE_EMAIL_FROM || 'noreply@littleangels.ac.ke';
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.smsApiKey) {
        console.warn('SMS API key not configured');
        return { success: false, error: 'SMS not configured' };
      }

      // Format phone number for Kenya
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': this.smsApiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: 'sandbox', // Use your Africa's Talking username
          to: formattedPhone,
          message: message,
          from: this.senderId
        })
      });

      const data = await response.json();
      
      if (data.SMSMessageData && data.SMSMessageData.Recipients) {
        const recipient = data.SMSMessageData.Recipients[0];
        return {
          success: recipient.status === 'Success',
          messageId: recipient.messageId,
          status: recipient.status,
          cost: recipient.cost
        };
      } else {
        return { success: false, error: 'SMS sending failed' };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmail(to, subject, message, htmlContent = null) {
    try {
      // Using a simple email service (you can integrate with SendGrid, AWS SES, etc.)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          text: message,
          html: htmlContent,
          from: this.emailFrom
        })
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send push notification
  async sendPushNotification(userId, title, message, data = {}) {
    try {
      // This would integrate with a push notification service like Firebase
      // For now, we'll just log it
      console.log('Push notification:', { userId, title, message, data });
      
      return { success: true, message: 'Push notification sent' };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send WhatsApp notification (using WhatsApp Business API)
  async sendWhatsApp(phoneNumber, message) {
    try {
      // This would integrate with WhatsApp Business API
      // For now, we'll just log it
      console.log('WhatsApp notification:', { phoneNumber, message });
      
      return { success: true, message: 'WhatsApp notification sent' };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  // Create and send notification
  async createNotification({
    title,
    message,
    type = 'info',
    priority = 'medium',
    recipients = [],
    channels = ['push'],
    sentBy,
    relatedEntity = null,
    schoolId
  }) {
    try {
      // Create notification record
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          title,
          message,
          type,
          priority,
          recipients,
          channels,
          sent_by: sentBy,
          status: 'pending',
          related_entity: relatedEntity,
          school_id: schoolId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
      }

      // Send notifications through specified channels
      const deliveryReport = {};
      
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'sms':
              if (recipients.length > 0) {
                // Get phone numbers for recipients
                const { data: users } = await supabase
                  .from('users')
                  .select('phone')
                  .in('id', recipients)
                  .not('phone', 'is', null);

                for (const user of users || []) {
                  const result = await this.sendSMS(user.phone, message);
                  deliveryReport[`sms_${user.id}`] = result;
                }
              }
              break;
              
            case 'email':
              if (recipients.length > 0) {
                // Get email addresses for recipients
                const { data: users } = await supabase
                  .from('users')
                  .select('email')
                  .in('id', recipients);

                for (const user of users || []) {
                  const result = await this.sendEmail(user.email, title, message);
                  deliveryReport[`email_${user.id}`] = result;
                }
              }
              break;
              
            case 'push':
              for (const recipientId of recipients) {
                const result = await this.sendPushNotification(recipientId, title, message);
                deliveryReport[`push_${recipientId}`] = result;
              }
              break;
              
            case 'whatsapp':
              if (recipients.length > 0) {
                const { data: users } = await supabase
                  .from('users')
                  .select('phone')
                  .in('id', recipients)
                  .not('phone', 'is', null);

                for (const user of users || []) {
                  const result = await this.sendWhatsApp(user.phone, message);
                  deliveryReport[`whatsapp_${user.id}`] = result;
                }
              }
              break;
          }
        } catch (channelError) {
          console.error(`Error sending ${channel} notification:`, channelError);
          deliveryReport[channel] = { success: false, error: channelError.message };
        }
      }

      // Update notification with delivery report
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          delivery_report: deliveryReport
        })
        .eq('id', notification.id);

      if (updateError) {
        console.error('Error updating notification delivery report:', updateError);
      }

      return { success: true, notification, deliveryReport };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bus arrival notification
  async sendBusArrivalNotification(vehicleId, stopName, estimatedArrival, recipients) {
    const title = 'Bus Arrival Notification';
    const message = `Bus is approaching ${stopName}. Estimated arrival: ${new Date(estimatedArrival).toLocaleTimeString()}. Please be ready for pickup.`;
    
    return await this.createNotification({
      title,
      message,
      type: 'info',
      priority: 'medium',
      recipients,
      channels: ['sms', 'push'],
      sentBy: vehicleId,
      relatedEntity: { type: 'vehicle', id: vehicleId },
      schoolId: recipients[0] ? (await this.getSchoolIdFromUserId(recipients[0])) : null
    });
  }

  // Send payment reminder
  async sendPaymentReminder(studentId, parentId, amount, dueDate) {
    const title = 'Payment Reminder';
    const message = `Transport fee payment of KES ${amount} is due on ${new Date(dueDate).toLocaleDateString()}. Please make payment via M-Pesa.`;
    
    return await this.createNotification({
      title,
      message,
      type: 'warning',
      priority: 'high',
      recipients: [parentId],
      channels: ['sms', 'email'],
      sentBy: studentId,
      relatedEntity: { type: 'payment', studentId },
      schoolId: await this.getSchoolIdFromUserId(parentId)
    });
  }

  // Send emergency notification
  async sendEmergencyNotification(vehicleId, driverId, emergencyType, location) {
    const title = `Emergency Alert - ${emergencyType.toUpperCase()}`;
    const message = `Emergency alert from vehicle ${vehicleId}. Location: ${location.lat}, ${location.lng}. Immediate attention required.`;
    
    // Get admin users for emergency notifications
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('school_id', await this.getSchoolIdFromUserId(driverId));

    return await this.createNotification({
      title,
      message,
      type: 'emergency',
      priority: 'high',
      recipients: admins?.map(admin => admin.id) || [],
      channels: ['sms', 'email', 'push'],
      sentBy: driverId,
      relatedEntity: { type: 'vehicle', id: vehicleId },
      schoolId: await this.getSchoolIdFromUserId(driverId)
    });
  }

  // Send attendance notification
  async sendAttendanceNotification(studentId, parentId, status, time) {
    const title = 'Student Attendance Update';
    const message = `Your child has been marked as ${status} at ${new Date(time).toLocaleTimeString()}.`;
    
    return await this.createNotification({
      title,
      message,
      type: 'info',
      priority: 'medium',
      recipients: [parentId],
      channels: ['sms', 'push'],
      sentBy: studentId,
      relatedEntity: { type: 'attendance', studentId },
      schoolId: await this.getSchoolIdFromUserId(parentId)
    });
  }

  // Get notifications for a user
  async getUserNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .contains('recipients', [userId])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user notifications:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .select('read_by')
        .eq('id', notificationId)
        .single();

      if (error) {
        console.error('Error fetching notification:', error);
        return { success: false, error: error.message };
      }

      const readBy = notification.read_by || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', notificationId);

      if (updateError) {
        console.error('Error marking notification as read:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to get school ID from user ID
  async getSchoolIdFromUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching school ID:', error);
        return null;
      }

      return data.school_id;
    } catch (error) {
      console.error('Error fetching school ID:', error);
      return null;
    }
  }

  // Format phone number for Kenya
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return '+' + cleaned;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;
