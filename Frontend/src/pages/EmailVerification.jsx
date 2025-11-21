import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get token from URL
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // Simulate API call to verify email
    setTimeout(() => {
      // Simulate successful verification
      const isValid = true; // In real app, check with backend
      
      if (isValid) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        localStorage.setItem('emailVerified', 'true');
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setStatus('error');
        setMessage('Verification link is invalid or has expired');
      }
    }, 2000);
  }, [searchParams, navigate]);

  const handleResendEmail = () => {
    alert('Verification email has been resent!');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card verification-card">
        <div className="verification-content">
          {status === 'verifying' && (
            <>
              <div className="verification-icon verifying">
                <RefreshCw size={48} className="spinning" />
              </div>
              <h1>Verifying Your Email</h1>
              <p>Please wait while we verify your email address...</p>
              <div className="verification-loader">
                <div className="loader-bar"></div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="verification-icon success">
                <CheckCircle size={64} />
              </div>
              <h1>Email Verified!</h1>
              <p>{message}</p>
              <div className="verification-success-message">
                <Mail size={20} />
                <span>You can now access all features of your account</span>
              </div>
              <div className="countdown-message">
                Redirecting to dashboard in <strong>{countdown}</strong> seconds...
              </div>
              <button className="auth-submit-btn" onClick={handleGoToDashboard}>
                Go to Dashboard Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="verification-icon error">
                <XCircle size={64} />
              </div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
              <div className="verification-error-actions">
                <button className="btn-resend" onClick={handleResendEmail}>
                  <Mail size={18} />
                  Resend Verification Email
                </button>
                <button className="btn-login" onClick={() => navigate('/login')}>
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        <div className="verification-help">
          <p>Need help? Contact support at <a href="mailto:support@rentifypro.com">support@rentifypro.com</a></p>
        </div>
      </div>

      <div className="auth-illustration">
        <div className="auth-illustration-content">
          <h2>Email Verification</h2>
          <p>Verify your email to unlock all features and secure your account.</p>
          <div className="auth-features">
            <div className="auth-feature-item">✓ Secure Your Account</div>
            <div className="auth-feature-item">✓ Enable All Features</div>
            <div className="auth-feature-item">✓ Password Recovery</div>
            <div className="auth-feature-item">✓ Important Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
