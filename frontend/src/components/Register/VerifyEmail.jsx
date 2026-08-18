// src/components/Register/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../services/api';
import { Mail, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import styles from './Register.module.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [statusState, setStatusState] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatusState('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatusState('success');
        setMessage(res.data.message || 'Your email has been verified successfully!');
      })
      .catch((err) => {
        setStatusState('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired or is invalid.');
      });
  }, [token]);

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
        {statusState === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Mail size={56} color="var(--color-orange)" style={{ animation: 'bounce 1s infinite alternate' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>Verifying Email</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 800 }}>Please wait while we verify your email address...</p>
          </div>
        )}

        {statusState === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle size={56} color="#107C41" />
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>Verification Successful!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 800 }}>{message}</p>
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
              <span>Go to Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {statusState === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <XCircle size={56} color="#D11A2A" />
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>Verification Failed</h2>
            <p style={{ fontSize: '14px', color: '#D11A2A', fontWeight: 800 }}>{message}</p>
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
                backgroundColor: 'transparent',
                color: 'var(--color-orange)',
                fontWeight: 900,
                fontSize: '15px',
                border: '2.5px solid var(--color-orange)',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
