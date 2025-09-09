import React, { useState } from 'react';

const PaymentGateway = ({ booking, onPaymentComplete, onPaymentCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        paymentId: `PAY_${Date.now()}`,
        amount: booking.totalPrice,
        method: paymentMethod,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
      
      // Update booking with payment info
      const updatedBooking = {
        ...booking,
        paymentStatus: 'PAID',
        paymentId: paymentData.paymentId,
        status: 'PENDING' // Still needs admin approval
      };
      
      onPaymentComplete(updatedBooking, paymentData);
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-credit-card me-2"></i>
              Secure Payment
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onPaymentCancel}></button>
          </div>
          
          <div className="modal-body">
            {/* Booking Summary */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h6 className="mb-0">Booking Summary</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Guest:</strong> {booking.guestName}</p>
                    <p><strong>Room:</strong> {booking.room?.roomNumber}</p>
                    <p><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> <span className="text-primary fw-bold">₹{booking.totalPrice?.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-4">
              <h6>Select Payment Method</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className={`card h-100 ${paymentMethod === 'card' ? 'border-primary' : ''}`} 
                       style={{cursor: 'pointer'}} onClick={() => setPaymentMethod('card')}>
                    <div className="card-body text-center">
                      <i className="fas fa-credit-card fa-2x mb-2 text-primary"></i>
                      <p className="mb-0">Credit/Debit Card</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`card h-100 ${paymentMethod === 'upi' ? 'border-primary' : ''}`} 
                       style={{cursor: 'pointer'}} onClick={() => setPaymentMethod('upi')}>
                    <div className="card-body text-center">
                      <i className="fas fa-mobile-alt fa-2x mb-2 text-success"></i>
                      <p className="mb-0">UPI Payment</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`card h-100 ${paymentMethod === 'wallet' ? 'border-primary' : ''}`} 
                       style={{cursor: 'pointer'}} onClick={() => setPaymentMethod('wallet')}>
                    <div className="card-body text-center">
                      <i className="fas fa-wallet fa-2x mb-2 text-warning"></i>
                      <p className="mb-0">Digital Wallet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'card' && (
              <div className="card">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Card Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CVV</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Cardholder Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="card">
                <div className="card-body text-center">
                  <i className="fas fa-qrcode fa-4x mb-3 text-muted"></i>
                  <p>Scan QR code with your UPI app</p>
                  <p className="text-muted">Or pay using UPI ID: hotel@paytm</p>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="card">
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-primary">Pay with Paytm</button>
                    <button className="btn btn-outline-success">Pay with PhonePe</button>
                    <button className="btn btn-outline-info">Pay with Google Pay</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onPaymentCancel}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Pay ₹{booking.totalPrice?.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;