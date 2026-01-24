// Notification Service (Mock SMS Implementation)
// As per project rules: Methods should simulate sending an SMS by logging the message and recipient

class NotificationService {
  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    console.log(`[SMS SENT TO ${phoneNumber}]: ${message}`);
    
    // Simulate SMS gateway processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response from SMS gateway
    const mockResponse = {
      success: true,
      messageId: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipient: phoneNumber,
      message: message,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'sent',
      cost: 0.50, // Mock cost in ETB
    };

    console.log(`[SMS DELIVERY CONFIRMED] Message ID: ${mockResponse.messageId}`);
    
    return {
      success: true,
      data: mockResponse,
      message: 'SMS sent successfully',
    };
  }

  // Send queue notification to patient
  async sendQueueNotification(patient, queue) {
    const message = `Dear ${patient.firstName}, your queue number is ${queue.queueNumber} for ${queue.serviceType} at ${queue.department}. Current wait time: approximately ${queue.estimatedWaitTime || 15} minutes. Please be ready.`;
    
    return await this.sendSMS(patient.phoneNumber, message);
  }

  // Send "next in queue" notification
  async sendNextInQueueNotification(patient, queue) {
    const message = `Dear ${patient.firstName}, you are next in queue (${queue.queueNumber}) for ${queue.serviceType} at ${queue.department}. Please proceed to the service area immediately.`;
    
    return await this.sendSMS(patient.phoneNumber, message);
  }

  // Send queue completion notification
  async sendQueueCompletionNotification(patient, queue) {
    const message = `Dear ${patient.firstName}, your consultation for ${queue.serviceType} at ${queue.department} is complete. Thank you for visiting Black Lion Hospital.`;
    
    return await this.sendSMS(patient.phoneNumber, message);
  }

  // Send appointment reminder
  async sendAppointmentReminder(patient, appointment) {
    const message = `Reminder: You have an appointment at ${appointment.time} tomorrow (${appointment.date}) for ${appointment.department} with Dr. ${appointment.doctor}. Please arrive 15 minutes early.`;
    
    return await this.sendSMS(patient.phoneNumber, message);
  }

  // Send emergency notification
  async sendEmergencyNotification(phoneNumber, message) {
    console.log(`[EMERGENCY SMS SENT TO ${phoneNumber}]: ${message}`);
    
    // Emergency messages are sent immediately
    const mockResponse = {
      success: true,
      messageId: `EMERGENCY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipient: phoneNumber,
      message: message,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'delivered',
      priority: 'high',
      cost: 0.75,
    };

    console.log(`[EMERGENCY SMS DELIVERY CONFIRMED] Message ID: ${mockResponse.messageId}`);
    
    return {
      success: true,
      data: mockResponse,
      message: 'Emergency SMS sent successfully',
    };
  }

  // Get SMS delivery status
  async getDeliveryStatus(messageId) {
    console.log(`[SMS STATUS CHECK] Checking delivery status for: ${messageId}`);
    
    // Mock status check
    const mockStatus = {
      messageId: messageId,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      recipient: '+251912345678',
    };

    return {
      success: true,
      data: mockStatus,
      message: 'Delivery status retrieved',
    };
  }

  // Bulk SMS sending for department announcements
  async sendBulkSMS(phoneNumbers, message) {
    console.log(`[BULK SMS SENDING] Sending to ${phoneNumbers.length} recipients`);
    
    const results = [];
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendSMS(phoneNumber, message);
      results.push({
        phoneNumber,
        ...result.data,
      });
    }

    console.log(`[BULK SMS COMPLETED] Sent to ${results.length} recipients`);
    
    return {
      success: true,
      data: {
        totalRecipients: phoneNumbers.length,
        successfulDeliveries: results.filter(r => r.success).length,
        results: results,
      },
      message: 'Bulk SMS sent successfully',
    };
  }
}

export default new NotificationService();
