# Frontend - Dashboard de Centavo 🖥️

Interfaz de usuario web (Dashboard SPA) para la gestión y visualización de finanzas personales. Desarrollado con **React 19**, **TypeScript** y **Vite**.

## Responsabilidades
- Panel principal con métricas, gráficos de gastos y estado de presupuestos.
- Formulario de captura rápida de gastos e ingresos.
- Vista de configuración de presupuestos y límites por categoría.
- Centro de alertas y notificaciones.
- Vista y descarga de reportes financieros.

---

## 🛠️ Estructura del Proyecto

```text
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Formularios de autenticación (LoginForm)
│   │   ├── common/         # Componentes base (Button, Input, Header, EmptyState)
│   │   └── transactions/   # Componentes de transacciones (StatSummary, TransactionList)
│   ├── hooks/              # Custom hooks desacoplados (useAuth, useTransactions)
│   ├── services/           # Capa de consumo API HTTP (apiClient, authService, transactionsService)
│   ├── styles/             # Variables y tokens de diseño de Centavo
│   ├── types/              # Definiciones e interfaces TypeScript
│   ├── App.tsx             # Orquestador de vistas (Login / Dashboard)
│   └── main.tsx            # Punto de entrada de la aplicación
├── package.json
└── vite.config.ts
```

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build

# Previsualizar el build de producción
npm run preview
```
