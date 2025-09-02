import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const UserLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === credentials.email && u.password === credentials.password);

    if (user) {
      const userData = {
        email: user.email,
        name: user.name,
        phone: user.phone,
        loginTime: new Date().toISOString(),
        userId: user.userId
      };
      
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      onLogin(true);
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password. Please check your credentials or sign up.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Check if user already exists
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const existingUser = registeredUsers.find(u => u.email === signUpData.email);

    if (existingUser) {
      setError('An account with this email already exists. Please sign in instead.');
      setLoading(false);
      return;
    }

    // Create new user account
    const newUser = {
      userId: Date.now(),
      name: signUpData.name,
      email: signUpData.email,
      password: signUpData.password,
      phone: signUpData.phone,
      createdAt: new Date().toISOString()
    };

    // Save to registered users
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Log in the user
    const userData = {
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      loginTime: new Date().toISOString(),
      userId: newUser.userId
    };
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    onLogin(true);
    navigate(from, { replace: true });
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
                    <i className="fas fa-building fa-2x text-primary"></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-2">
                  <i className="fas fa-building me-2" style={{color: '#ff6b35'}}></i>
                  ZENStay
                </h2>
                <p className="mb-0 opacity-75">
                  {isSignUp ? 'Create your account to get started' : 'Welcome back! Please sign in to your account'}
                </p>
              </div>

              <div className="card-body p-5">
                {/* Toggle Buttons */}
                <div className="btn-group w-100 mb-4" role="group">
                  <button 
                    type="button" 
                    className={`btn ${!isSignUp ? 'btn-primary' : 'btn-outline-primary'} fw-semibold`}
                    onClick={() => {setIsSignUp(false); setError('');}}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>Sign In
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${isSignUp ? 'btn-primary' : 'btn-outline-primary'} fw-semibold`}
                    onClick={() => {setIsSignUp(true); setError('');}}
                  >
                    <i className="fas fa-user-plus me-2"></i>Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger border-0 rounded-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Login Form */}
                {!isSignUp ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-semibold">
                        <i className="fas fa-envelope me-2 text-primary"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2"
                        id="email"
                        placeholder="Enter your email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        required
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
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                        <label className="form-check-label text-muted" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="text-primary text-decoration-none small">
                        Forgot Password?
                      </a>
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
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Sign Up Form */
                  <form onSubmit={handleSignUp}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        <i className="fas fa-user me-2 text-primary"></i>Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        id="name"
                        placeholder="Enter your full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupEmail" className="form-label fw-semibold">
                        <i className="fas fa-envelope me-2 text-primary"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2"
                        id="signupEmail"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        <i className="fas fa-phone me-2 text-primary"></i>Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg border-2"
                        id="phone"
                        placeholder="Enter your phone number"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupPassword" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2"
                        id="signupPassword"
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-check mb-4">
                      <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                      <label className="form-check-label text-muted small" htmlFor="agreeTerms">
                        I agree to the <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 fw-semibold mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>
                  </form>
                )}



                {/* Social Login */}
                <div className="text-center mb-4">
                  <div className="position-relative">
                    <hr className="my-4" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                      Or continue with
                    </span>
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-outline-danger flex-fill">
                      <i className="fab fa-google me-2"></i>Google
                    </button>
                    <button className="btn btn-outline-primary flex-fill">
                      <i className="fab fa-facebook-f me-2"></i>Facebook
                    </button>
                  </div>
                </div>


              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                <i className="fas fa-shield-alt me-1"></i>
                Your data is secure and encrypted with us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;