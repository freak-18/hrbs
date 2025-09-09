// Notification system for email alerts
export const sendNotification = async (type, data) => {
  // Simulate email notification service
  const notifications = {
    BOOKING_CREATED: {
      subject: `Booking Confirmation - #${data.bookingId}`,
      template: 'booking_created',
      recipients: [data.guestEmail, 'admin@hotel.com']
    },
    PAYMENT_SUCCESS: {
      subject: `Payment Successful - Booking #${data.bookingId}`,
      template: 'payment_success',
      recipients: [data.guestEmail, 'admin@hotel.com']
    },
    PAYMENT_FAILED: {
      subject: `Payment Failed - Booking #${data.bookingId}`,
      template: 'payment_failed',
      recipients: [data.guestEmail]
    },
    BOOKING_APPROVED: {
      subject: `Booking Approved - #${data.bookingId}`,
      template: 'booking_approved',
      recipients: [data.guestEmail]
    },
    BOOKING_REJECTED: {
      subject: `Booking Cancelled - #${data.bookingId}`,
      template: 'booking_rejected',
      recipients: [data.guestEmail]
    },
    AUTO_REJECT_UNPAID: {
      subject: `Booking Auto-Cancelled - Payment Not Received #${data.bookingId}`,
      template: 'auto_reject',
      recipients: [data.guestEmail, 'admin@hotel.com']
    }
  };

  const notification = notifications[type];
  if (!notification) return;

  // Store notification in localStorage for demo
  const existingNotifications = JSON.parse(localStorage.getItem('hotelNotifications') || '[]');
  const newNotification = {
    id: Date.now(),
    type,
    subject: notification.subject,
    recipients: notification.recipients,
    data,
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };
  
  existingNotifications.push(newNotification);
  localStorage.setItem('hotelNotifications', JSON.stringify(existingNotifications));
  
  console.log(`📧 Email sent: ${notification.subject} to ${notification.recipients.join(', ')}`);
  return newNotification;
};

// Auto-reject unpaid bookings after timeout
export const scheduleAutoReject = (bookingId, timeoutMinutes = 30) => {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  
  setTimeout(() => {
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking && booking.paymentStatus !== 'PAID' && booking.status === 'PENDING') {
      // Auto-reject the booking
      const updatedBookings = bookings.map(b => 
        b.bookingId === bookingId 
          ? { ...b, status: 'REJECTED', rejectionReason: 'Payment not received within time limit' }
          : b
      );
      
      localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
      
      // Send notification
      sendNotification('AUTO_REJECT_UNPAID', booking);
      
      // Emit event for real-time updates
      if (typeof window !== 'undefined' && window.eventBus) {
        window.eventBus.emit('BOOKING_UPDATED', { 
          bookingId, 
          status: 'REJECTED',
          reason: 'auto_reject_unpaid'
        });
      }
    }
  }, timeoutMs);
};