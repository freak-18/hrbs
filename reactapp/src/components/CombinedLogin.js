import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CombinedLogin = ({ onUserLogin, onAdminLogin }) => {
  const [loginType, setLoginType] = useState('user');
  const [userCredentials, setUserCredentials] = useState({ email: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!userCredentials.email || !userCredentials.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === userCredentials.email && u.password === userCredentials.password);

    if (user) {
      const userData = {
        email: user.email, name: user.name, phone: user.phone,
        loginTime: new Date().toISOString(), userId: user.userId
      };
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      onUserLogin(true);
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password. Please check your credentials or sign up.');
    }
    setLoading(false);
  };

  const handleUserSignUp = async (e) => {
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

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const existingUser = registeredUsers.find(u => u.email === signUpData.email);

    if (existingUser) {
      setError('An account with this email already exists. Please sign in instead.');
      setLoading(false);
      return;
    }

    const newUser = {
      userId: Date.now(), name: signUpData.name, email: signUpData.email,
      password: signUpData.password, phone: signUpData.phone, createdAt: new Date().toISOString()
    };

    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    const userData = {
      email: newUser.email, name: newUser.name, phone: newUser.phone,
      loginTime: new Date().toISOString(), userId: newUser.userId
    };
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    onUserLogin(true);
    navigate(from, { replace: true });
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        username: 'admin', name: 'Administrator', role: 'Super Admin', loginTime: new Date().toISOString()
      }));
      onAdminLogin(true);
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative'
    }}>
      <div className="position-absolute w-100 h-100" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }}></div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-9">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <div className="mb-3">
                  <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{width: '80px', height: '80px'}}>
                    <i className={`fas ${loginType === 'admin' ? 'fa-shield-alt' : 'fa-building'} fa-2x text-primary`}></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-2">
                  <i className="fas fa-building me-2" style={{color: '#ff6b35'}}></i>
                  ZENStay
                </h2>
                <p className="mb-0 opacity-75">
                  {loginType === 'admin' ? 'Admin Portal Access' : 
                   isSignUp ? 'Create your account to get started' : 'Welcome back! Please sign in to your account'}
                </p>
              </div>

              <div className="card-body p-5">
                {/* Login Type Toggle */}
                <div className="btn-group w-100 mb-4" role="group">
                  <button 
                    type="button" 
                    className={`btn ${loginType === 'user' ? 'btn-primary' : 'btn-outline-primary'} fw-semibold`}
                    onClick={() => {setLoginType('user'); setError(''); setIsSignUp(false);}}
                  >
                    <i className="fas fa-user me-2"></i>User Login
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${loginType === 'admin' ? 'btn-primary' : 'btn-outline-primary'} fw-semibold`}
                    onClick={() => {setLoginType('admin'); setError(''); setIsSignUp(false);}}
                  >
                    <i className="fas fa-shield-alt me-2"></i>Admin Login
                  </button>
                </div>

                {/* User Login/Signup Toggle */}
                {loginType === 'user' && (
                  <div className="btn-group w-100 mb-4" role="group">
                    <button 
                      type="button" 
                      className={`btn ${!isSignUp ? 'btn-success' : 'btn-outline-success'} fw-semibold`}
                      onClick={() => {setIsSignUp(false); setError('');}}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>Sign In
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${isSignUp ? 'btn-success' : 'btn-outline-success'} fw-semibold`}
                      onClick={() => {setIsSignUp(true); setError('');}}
                    >
                      <i className="fas fa-user-plus me-2"></i>Sign Up
                    </button>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger border-0 rounded-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Admin Login Form */}
                {loginType === 'admin' && (
                  <form onSubmit={handleAdminLogin}>
                    <div className="mb-4">
                      <label htmlFor="adminUsername" className="form-label fw-semibold">
                        <i className="fas fa-user me-2 text-primary"></i>Username
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        id="adminUsername"
                        placeholder="Enter admin username"
                        value={adminCredentials.username}
                        onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="adminPassword" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2"
                        id="adminPassword"
                        placeholder="Enter admin password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold mb-3" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing In...</>
                      ) : (
                        <><i className="fas fa-sign-in-alt me-2"></i>Sign In to Dashboard</>
                      )}
                    </button>
                    <div className="bg-light rounded-3 p-3">
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
                  </form>
                )}

                {/* User Login Form */}
                {loginType === 'user' && !isSignUp && (
                  <form onSubmit={handleUserLogin}>
                    <div className="mb-4">
                      <label htmlFor="userEmail" className="form-label fw-semibold">
                        <i className="fas fa-envelope me-2 text-primary"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2"
                        id="userEmail"
                        placeholder="Enter your email"
                        value={userCredentials.email}
                        onChange={(e) => setUserCredentials({...userCredentials, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="userPassword" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2"
                        id="userPassword"
                        placeholder="Enter your password"
                        value={userCredentials.password}
                        onChange={(e) => setUserCredentials({...userCredentials, password: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success btn-lg w-100 fw-semibold mb-3" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing In...</>
                      ) : (
                        <><i className="fas fa-sign-in-alt me-2"></i>Sign In</>
                      )}
                    </button>
                  </form>
                )}

                {/* User Sign Up Form */}
                {loginType === 'user' && isSignUp && (
                  <form onSubmit={handleUserSignUp}>
                    <div className="mb-3">
                      <label htmlFor="signupName" className="form-label fw-semibold">
                        <i className="fas fa-user me-2 text-primary"></i>Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        id="signupName"
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
                      <label htmlFor="signupPhone" className="form-label fw-semibold">
                        <i className="fas fa-phone me-2 text-primary"></i>Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg border-2"
                        id="signupPhone"
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
                    <button type="submit" className="btn btn-success btn-lg w-100 fw-semibold mb-3" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating Account...</>
                      ) : (
                        <><i className="fas fa-user-plus me-2"></i>Create Account</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedLogin;