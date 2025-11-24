import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { forgotPassword, verifyOTP, resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await forgotPassword(email);

      // Show success message
      alert(data.message || 'OTP sent to your email!');
      setIsLoading(false);
      setStep(2);
    } catch (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await verifyOTP(email, verificationCode);

      // Show success message
      alert(data.message || 'OTP verified successfully!');
      setIsLoading(false);
      setStep(3);
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await resetPassword(email, newPassword);

      // Show success message
      setIsLoading(false);
      alert(data.message || 'Password reset successful! You can now login with your new password.');
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    alert('Verification code resent to your email!');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="auth-back-btn">
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        <div className="auth-header">
          <div className="auth-logo">🏢</div>
          <h1>
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Verify Email'}
            {step === 3 && 'Reset Password'}
          </h1>
          <p>
            {step === 1 && "No worries, we'll send you reset instructions."}
            {step === 2 && 'Enter the 6-digit code we sent to your email.'}
            {step === 3 && 'Enter your new password below.'}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  className={error ? 'error' : ''}
                />
              </div>
              {error && <span className="auth-error">{error}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerificationSubmit} className="auth-form">
            <div className="verification-code-section">
              <div className="sent-to-email">
                <Mail size={20} />
                <span>Code sent to {email}</span>
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="Enter 6-digit code"
                className={`verification-code-input ${error ? 'error' : ''}`}
                maxLength="6"
              />
              {error && <span className="auth-error">{error}</span>}
            </div>

            <div className="resend-code">
              <span>Didn't receive the code?</span>
              <button type="button" onClick={handleResendCode} className="resend-btn">
                Resend
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Verify Code
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter new password"
                  className={error ? 'error' : ''}
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirm new password"
                  className={error ? 'error' : ''}
                />
              </div>
              {error && <span className="auth-error">{error}</span>}
            </div>

            <div className="password-requirements">
              <p>Password must:</p>
              <ul>
                <li className={newPassword.length >= 6 ? 'met' : ''}>
                  Be at least 6 characters long
                </li>
                <li className={newPassword === confirmPassword && newPassword ? 'met' : ''}>
                  Match the confirmation
                </li>
              </ul>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Progress Indicator */}
        <div className="reset-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Email</span>
          </div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Verify</span>
          </div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Reset</span>
          </div>
        </div>
      </div>

      <div className="auth-illustration">
        <div className="auth-illustration-content">
          <h2>Secure Password Reset</h2>
          <p>We take your account security seriously. Follow the steps to reset your password safely.</p>
          <div className="auth-features">
            <div className="auth-feature-item">✓ Email Verification</div>
            <div className="auth-feature-item">✓ Secure Process</div>
            <div className="auth-feature-item">✓ Quick Recovery</div>
            <div className="auth-feature-item">✓ 24/7 Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
