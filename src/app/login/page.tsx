'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FEFDFC',
        fontFamily: 'var(--font-inter, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* App name */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#25221E',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            ToDo
          </h1>
          <p
            style={{
              fontSize: 15,
              color: '#6B6560',
              margin: '8px 0 0',
            }}
          >
            Your personal task &amp; habit manager
          </p>
        </div>

        {/* Sign-in card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E4DF',
            borderRadius: 16,
            padding: '32px 40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            minWidth: 320,
          }}
        >
          <p style={{ fontSize: 15, color: '#25221E', margin: 0, fontWeight: 500 }}>
            Sign in to continue
          </p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid #E8E4DF',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500,
              color: '#25221E',
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'box-shadow 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)';
              e.currentTarget.style.borderColor = '#C8C4BF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#E8E4DF';
            }}
          >
            {/* Google logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
