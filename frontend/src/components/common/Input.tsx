import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  id,
  style,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--centavo-text-main)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--centavo-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          style={{
            width: '100%',
            padding: leftIcon ? '0.625rem 0.75rem 0.625rem 2.5rem' : '0.625rem 0.75rem',
            fontSize: '0.95rem',
            color: 'var(--centavo-text-main)',
            backgroundColor: 'var(--centavo-surface)',
            border: `1px solid ${error ? 'var(--centavo-danger)' : 'var(--centavo-border)'}`,
            borderRadius: 'var(--centavo-radius-sm)',
            outline: 'none',
            transition: 'var(--centavo-transition)',
            boxShadow: 'var(--centavo-shadow-sm)',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--centavo-primary)';
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--centavo-border)';
          }}
          {...props}
        />
      </div>

      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--centavo-danger)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--centavo-text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}
