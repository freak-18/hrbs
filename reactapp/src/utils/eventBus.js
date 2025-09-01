// Event Bus for real-time communication between components
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
    // Also trigger storage event for cross-tab communication
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hotel-data-update', { detail: { event, data } }));
    }
  }
}

export const eventBus = new EventBus();

// Event types
export const EVENTS = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_UPDATED: 'booking_updated',
  ROOM_UPDATED: 'room_updated',
  DATA_REFRESH: 'data_refresh'
};

// Global refresh function for manual testing
if (typeof window !== 'undefined') {
  window.refreshHotelData = () => {
    eventBus.emit(EVENTS.DATA_REFRESH, { source: 'manual' });
  };
}