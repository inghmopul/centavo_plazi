import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/common/Header';
import { StatSummary } from './components/transactions/StatSummary';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { Bell, Sparkles } from 'lucide-react';
import type { CreateTransactionInput } from './types/transaction';

export function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading, error: authError, login, logout } = useAuth();
  const { transactions, summary, isLoading: isTxLoading, addTransaction } = useTransactions();
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAddTransactionClick = () => {
    setIsModalOpen(true);
  };

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    await addTransaction(data);
    setIsModalOpen(false);
    setNotification(`¡Transacción "${data.title}" registrada exitosamente!`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Pantalla de carga mientras se verifica la sesión existente
  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--centavo-bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              width: '2.5rem',
              height: '2.5rem',
              border: '3px solid var(--centavo-border)',
              borderTopColor: 'var(--centavo-primary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '1rem', color: 'var(--centavo-text-muted)', fontSize: '0.9rem' }}>
            Iniciando Centavo...
          </p>
        </div>
      </div>
    );
  }

  // Vista no autenticada: Pantalla de Login
  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={login}
        isLoading={isAuthLoading}
        error={authError}
      />
    );
  }

  // Vista autenticada: Dashboard principal
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={logout} />

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="centavo-container">
          {/* Banner de notificación temporal si se pulsa acción */}
          {notification && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                backgroundColor: 'var(--centavo-primary-light)',
                border: '1px solid var(--centavo-primary)',
                borderRadius: 'var(--centavo-radius-md)',
                color: 'var(--centavo-primary-hover)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              <Bell size={18} />
              <span>{notification}</span>
            </div>
          )}

          {/* Encabezado de Bienvenida */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--centavo-text-main)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ¡Hola, {user?.name || 'Usuario'}! 👋
                </h1>
              </div>
              <p style={{ color: 'var(--centavo-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Este es el estado consolidado de tus finanzas personales en Centavo.
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--centavo-surface)',
                border: '1px solid var(--centavo-border)',
                borderRadius: 'var(--centavo-radius-full)',
                fontSize: '0.85rem',
                color: 'var(--centavo-text-muted)',
              }}
            >
              <Sparkles size={16} color="var(--centavo-copper)" />
              <span>Presupuesto mensual al día</span>
            </div>
          </div>

          {/* Tarjetas de Resumen (Balance, Ingresos, Gastos) */}
          <StatSummary summary={summary} />

          {/* Listado de Transacciones (con Estado Vacío) */}
          <TransactionList
            transactions={transactions}
            isLoading={isTxLoading}
            onAddTransaction={handleAddTransactionClick}
          />

          {/* Modal de Creación de Transacción */}
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateTransaction}
          />
        </div>
      </main>

      {/* Footer del Dashboard */}
      <footer
        style={{
          borderTop: '1px solid var(--centavo-border)',
          backgroundColor: 'var(--centavo-surface)',
          padding: '1.25rem 0',
          marginTop: 'auto',
          textAlign: 'center',
        }}
      >
        <div className="centavo-container">
          <p style={{ fontSize: '0.8rem', color: 'var(--centavo-text-muted)' }}>
            Centavo 🪙 &copy; {new Date().getFullYear()} - Sistema de Finanzas Personales. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
