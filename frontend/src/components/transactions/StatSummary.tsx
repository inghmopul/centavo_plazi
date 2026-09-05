import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import type { TransactionSummary } from '../../types/transaction';

export interface StatSummaryProps {
  summary: TransactionSummary;
}

export function StatSummary({ summary }: StatSummaryProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const cards = [
    {
      title: 'Balance Total',
      amount: summary.totalBalance,
      icon: <Wallet size={24} />,
      iconBg: 'var(--centavo-primary-light)',
      iconColor: 'var(--centavo-primary)',
    },
    {
      title: 'Ingresos Totales',
      amount: summary.totalIncome,
      icon: <TrendingUp size={24} />,
      iconBg: '#dcfce7',
      iconColor: 'var(--centavo-income)',
    },
    {
      title: 'Gastos Totales',
      amount: summary.totalExpense,
      icon: <TrendingDown size={24} />,
      iconBg: '#fee2e2',
      iconColor: 'var(--centavo-expense)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className="centavo-card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--centavo-text-muted)',
                fontWeight: 500,
              }}
            >
              {card.title}
            </span>
            <div
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--centavo-text-main)',
                marginTop: '0.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(card.amount)}
            </div>
          </div>

          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--centavo-radius-md)',
              backgroundColor: card.iconBg,
              color: card.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
