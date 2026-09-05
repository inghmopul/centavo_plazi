import React, { useState } from 'react';
import { Mail, Lock, Coins, AlertCircle } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { LoginCredentials } from '../../types/auth';

export interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<unknown>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onLogin, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('demo@centavo.app');
  const [password, setPassword] = useState('centavo123');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setValidationError('Ingresa tu contraseña.');
      return;
    }

    try {
      await onLogin({ email, password });
    } catch {
      // El error ya queda registrado en el hook y se pasa por props
    }
  };

  const displayError = validationError || error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--centavo-bg)',
      }}
    >
      <div
        className="centavo-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--centavo-shadow-lg)',
        }}
      >
        {/* Cabecera del formulario */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--centavo-radius-lg)',
              backgroundColor: 'var(--centavo-primary)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--centavo-shadow-md)',
              marginBottom: '1rem',
            }}
          >
            <Coins size={32} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--centavo-text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Iniciar Sesión
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--centavo-text-muted)', marginTop: '0.25rem' }}>
            Ingresa a tu dashboard de finanzas en <strong>Centavo</strong>
          </p>
        </div>

        {/* Mensaje de error si existe */}
        {displayError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: 'var(--centavo-radius-sm)',
              backgroundColor: 'var(--centavo-danger-bg)',
              border: '1px solid var(--centavo-danger)',
              color: 'var(--centavo-danger)',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@centavo.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Entrar a Centavo
          </Button>
        </form>

        {/* Credenciales de demostración */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--centavo-border)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--centavo-text-muted)',
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Acceso rápido de prueba:</strong>
          <br />
          Email: <code>demo@centavo.app</code> | Clave: <code>centavo123</code>
        </div>
      </div>
    </div>
  );
}
