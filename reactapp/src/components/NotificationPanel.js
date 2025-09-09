import React, { useState, useEffect } from 'react';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('hotelNotifications') || '[]');
      setNotifications(storedNotifications.slice(-10).reverse()); // Show last 10 notifications
    };

    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED': return 'fas fa-calendar-plus text-info';
      case 'PAYMENT_SUCCESS': return 'fas fa-check-circle text-success';
      case 'PAYMENT_FAILED': return 'fas fa-times-circle text-danger';
      case 'BOOKING_APPROVED': return 'fas fa-thumbs-up text-success';
      case 'BOOKING_REJECTED': return 'fas fa-thumbs-down text-danger';
      case 'AUTO_REJECT_UNPAID': return 'fas fa-exclamation-triangle text-warning';
      default: return 'fas fa-bell text-muted';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="position-relative">
      <button 
        className="btn btn-outline-primary btn-sm position-relative"
        onClick={() => setShowPanel(!showPanel)}
      >
        <i className="fas fa-bell me-1"></i>
        Notifications
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg" 
             style={{width: '350px', maxHeight: '400px', zIndex: 1050}}>
          <div className="p-3 border-bottom bg-light">
            <h6 className="mb-0">
              <i className="fas fa-bell me-2"></i>
              Recent Notifications
            </h6>
          </div>
          
          <div className="overflow-auto" style={{maxHeight: '300px'}}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="fas fa-inbox fa-2x mb-2"></i>
                <p className="mb-0">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-3 border-bottom">
                  <div className="d-flex align-items-start">
                    <i className={`${getNotificationIcon(notification.type)} me-2 mt-1`}></i>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">{notification.subject}</div>
                      <div className="text-muted small">
                        To: {notification.recipients.join(', ')}
                      </div>
                      <div className="text-muted small">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-top text-center">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  localStorage.removeItem('hotelNotifications');
                  setNotifications([]);
                }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;