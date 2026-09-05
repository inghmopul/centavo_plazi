import { LogOut, Coins, User as UserIcon } from 'lucide-react';
import type { User } from '../../types/auth';
import { Button } from './Button';

export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header
      style={{
        backgroundColor: 'var(--centavo-surface)',
        borderBottom: '1px solid var(--centavo-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="centavo-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Marca / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--centavo-radius-md)',
              backgroundColor: 'var(--centavo-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--centavo-shadow-sm)',
            }}
          >
            <Coins size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--centavo-text-main)' }}>
                Centavo
              </span>
              <span className="centavo-badge centavo-badge-copper">v0.1.0</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--centavo-text-muted)', margin: 0 }}>
              Control de Finanzas Personales
            </p>
          </div>
        </div>

        {/* Sección de Usuario y Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--centavo-surface-alt)',
                borderRadius: 'var(--centavo-radius-full)',
                border: '1px solid var(--centavo-border)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--centavo-primary-light)',
                  color: 'var(--centavo-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <UserIcon size={16} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--centavo-text-main)' }}>
                {user.name || user.email}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut size={16} />}
            title="Cerrar sesión"
          >
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
