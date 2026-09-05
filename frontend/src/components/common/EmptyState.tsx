import React from 'react';
import { Receipt, PlusCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No hay transacciones registradas',
  description = 'Comienza registrando tus primeros ingresos o gastos para llevar un seguimiento detallado de tus finanzas personales.',
  actionLabel = 'Registrar primera transacción',
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        borderRadius: 'var(--centavo-radius-md)',
        backgroundColor: 'var(--centavo-surface)',
        border: '2px dashed var(--centavo-border)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--centavo-primary-subtle)',
          color: 'var(--centavo-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {icon || <Receipt size={32} />}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--centavo-text-main)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--centavo-text-muted)',
          maxWidth: '480px',
          lineHeight: 1.6,
          marginBottom: '1.75rem',
        }}
      >
        {description}
      </p>

      {onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          leftIcon={<PlusCircle size={18} />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
