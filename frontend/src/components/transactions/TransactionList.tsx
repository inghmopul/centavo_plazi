import { useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onAddTransaction?: () => void;
}

export function TransactionList({
  transactions,
  isLoading = false,
  onAddTransaction,
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredTransactions = transactions.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div className="centavo-card" style={{ padding: '1.5rem' }}>
      {/* Barra superior de la tabla de transacciones */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--centavo-border)',
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
            Movimientos y Transacciones
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--centavo-text-muted)', marginTop: '0.125rem' }}>
            Historial detallado de tus ingresos y gastos categorizados
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Filtro rápido */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem',
              backgroundColor: 'var(--centavo-surface-alt)',
              borderRadius: 'var(--centavo-radius-sm)',
              border: '1px solid var(--centavo-border)',
            }}
          >
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => {
              const labels = {
                ALL: 'Todos',
                INCOME: 'Ingresos',
                EXPENSE: 'Gastos',
              };
              const isSelected = filterType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 500,
                    borderRadius: 'var(--centavo-radius-sm)',
                    backgroundColor: isSelected ? 'var(--centavo-surface)' : 'transparent',
                    color: isSelected ? 'var(--centavo-text-main)' : 'var(--centavo-text-muted)',
                    boxShadow: isSelected ? 'var(--centavo-shadow-sm)' : 'none',
                    transition: 'var(--centavo-transition)',
                  }}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddTransaction}
            leftIcon={<Plus size={16} />}
          >
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Contenido: Estado de Carga, Listado Vacío o Filas */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 0',
            color: 'var(--centavo-text-muted)',
          }}
        >
          <span
            style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid var(--centavo-border)',
              borderTopColor: 'var(--centavo-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '1rem',
            }}
          />
          <p style={{ fontSize: '0.9rem' }}>Cargando transacciones...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title={
            filterType === 'ALL'
              ? 'No hay transacciones registradas'
              : `No se encontraron ${filterType === 'INCOME' ? 'ingresos' : 'gastos'}`
          }
          description={
            filterType === 'ALL'
              ? 'Aún no tienes movimientos en tu cuenta de Centavo. Registra tu primer ingreso o gasto para comenzar el monitoreo financiero.'
              : `No tienes registros en la categoría de ${filterType === 'INCOME' ? 'ingresos' : 'gastos'}. Puedes añadir uno nuevo o cambiar los filtros.`
          }
          actionLabel="Registrar transacción"
          onAction={onAddTransaction}
          icon={<Filter size={32} />}
        />
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {/* Si hubieran transacciones se listan aquí */}
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--centavo-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--centavo-text-main)' }}>{tx.title}</strong>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--centavo-radius-full)',
                      backgroundColor: 'var(--centavo-copper-light)',
                      color: 'var(--centavo-copper)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {tx.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--centavo-text-muted)', marginTop: '0.2rem' }}>
                  {tx.date || new Date().toISOString().split('T')[0]} {tx.notes ? `• ${tx.notes}` : ''}
                </p>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: tx.type === 'INCOME' ? 'var(--centavo-income)' : 'var(--centavo-expense)',
                }}
              >
                {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
