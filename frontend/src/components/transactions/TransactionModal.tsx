import React, { useState } from 'react';
import { X, Tag, DollarSign, FileText } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { CreateTransactionInput, TransactionType } from '../../types/transaction';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
}

const CATEGORIES = [
  'Comida',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Ocio',
  'Salud',
  'Educación',
  'Otros'
];

export function TransactionModal({ isOpen, onClose, onSubmit }: TransactionModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('Comida');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (!title.trim()) {
      setError('Por favor ingresa un concepto o descripción.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        notes: notes.trim() || undefined
      });
      // Limpiar formulario y cerrar
      setTitle('');
      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="centavo-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          boxShadow: 'var(--centavo-shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Encabezado del modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--centavo-text-main)',
              }}
            >
              Registrar Movimiento
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--centavo-text-muted)' }}>
              Ingresa el detalle de tu nuevo gasto o ingreso
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--centavo-text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--centavo-radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de Tipo (Gasto / Ingreso) */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.25rem',
            backgroundColor: 'var(--centavo-surface-alt)',
            borderRadius: 'var(--centavo-radius-sm)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 'var(--centavo-radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: type === 'EXPENSE' ? 'var(--centavo-danger)' : 'transparent',
              color: type === 'EXPENSE' ? '#ffffff' : 'var(--centavo-text-muted)',
              transition: 'var(--centavo-transition)',
            }}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 'var(--centavo-radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: type === 'INCOME' ? 'var(--centavo-income)' : 'transparent',
              color: type === 'INCOME' ? '#ffffff' : 'var(--centavo-text-muted)',
              transition: 'var(--centavo-transition)',
            }}
          >
            Ingreso
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: 'var(--centavo-radius-sm)',
              backgroundColor: 'var(--centavo-danger-bg)',
              color: 'var(--centavo-danger)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Monto */}
          <Input
            label="Monto ($)"
            type="number"
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign size={18} />}
            required
            autoFocus
          />

          {/* Categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor="category-select"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--centavo-text-main)',
              }}
            >
              Categoría
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                <Tag size={18} />
              </span>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                  fontSize: '0.95rem',
                  color: 'var(--centavo-text-main)',
                  backgroundColor: 'var(--centavo-surface)',
                  border: '1px solid var(--centavo-border)',
                  borderRadius: 'var(--centavo-radius-sm)',
                  outline: 'none',
                  boxShadow: 'var(--centavo-shadow-sm)',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Concepto / Título */}
          <Input
            label="Concepto"
            type="text"
            placeholder="Ej: Almuerzo ejecutivo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            leftIcon={<FileText size={18} />}
            required
          />

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              style={{ flex: 1 }}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
