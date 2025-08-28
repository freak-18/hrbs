import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple admin credentials check
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        username: 'admin',
        name: 'Administrator',
        role: 'Super Admin',
        loginTime: new Date().toISOString()
      }));
      onLogin(true);
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div className="position-absolute w-100 h-100" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }}></div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-9">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              {/* Header */}
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <div className="mb-3">
                  <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-shield-alt fa-2x text-primary"></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-2">Admin Portal</h2>
                <p className="mb-0 opacity-75">Secure access to management dashboard</p>
              </div>

              <div className="card-body p-5">
                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger border-0 rounded-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label fw-semibold">
                      <i className="fas fa-user me-2 text-primary"></i>Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      id="username"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="fas fa-lock me-2 text-primary"></i>Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg border-2"
                      id="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Remember me for 30 days
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 fw-semibold mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In to Dashboard
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="bg-light rounded-3 p-3 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-info-circle text-info me-2"></i>
                    <strong className="text-dark">Demo Credentials</strong>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted d-block">Username:</small>
                      <code className="text-primary">admin</code>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Password:</small>
                      <code className="text-primary">admin123</code>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="row text-center text-muted small">
                  <div className="col-4">
                    <i className="fas fa-shield-alt text-success mb-1 d-block"></i>
                    <span>SSL Secured</span>
                  </div>
                  <div className="col-4">
                    <i className="fas fa-lock text-warning mb-1 d-block"></i>
                    <span>Encrypted</span>
                  </div>
                  <div className="col-4">
                    <i className="fas fa-eye-slash text-info mb-1 d-block"></i>
                    <span>Private</span>
                  </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-4 pt-3 border-top">
                  <button 
                    onClick={() => navigate('/')}
                    className="btn btn-link text-decoration-none text-muted"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                <i className="fas fa-clock me-1"></i>
                For security, admin sessions expire after 2 hours of inactivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;