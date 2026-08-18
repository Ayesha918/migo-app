// src/components/Register/ResetPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './Register.module.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired or already been used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#FAF9F6',
      padding: '24px',
      fontFamily: 'inherit',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: '3px solid var(--color-peach)',
        borderRadius: '24px',
        padding: '36px 24px',
        boxShadow: '0 8px 30px rgba(255, 122, 0, 0.05)'
      }}>
        {!success ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <KeyRound size={56} color="var(--color-orange)" />
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>Reset Password</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 800 }}>Enter your new password below to update your account access.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  fontWeight: 800,
                  border: '2px solid var(--color-peach)',
                  borderRadius: '16px',
                  outline: 'none',
                  color: 'var(--text-dark)'
                }}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  fontWeight: 800,
                  border: '2px solid var(--color-peach)',
                  borderRadius: '16px',
                  outline: 'none',
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            {error && <p style={{ fontSize: '12px', color: '#D11A2A', fontWeight: 800, margin: '4px 0' }}>{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-orange)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)',
                marginTop: '8px'
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 size={56} color="#107C41" />
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>Password Updated!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 800 }}>Your password has been successfully reset. You can now use your new password to log in.</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-orange)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)',
                marginTop: '16px'
              }}
            >
              <span>Back to Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
