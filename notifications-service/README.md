# Notifications Service 🔔

Microservicio independiente responsable de emitir alertas y avisos ante eventos de sobregasto y transacciones críticas en la plataforma **Centavo**.

---

## 🎯 Responsabilidades
- Recepción de eventos de nuevas transacciones emitidos por `transactions-service` o el frontend.
- Comparación contra el presupuesto correspondiente (`budgets-service`).
- Detección de sobregastos (>100%) y umbrales de alerta temprana (>=80%).
- Emisión y persistencia de notificaciones/alertas para el usuario.
- Exposición de endpoints para consulta y gestión del historial de alertas.

---

## 🛠️ Tecnologías
- **Node.js** con **TypeScript** (ES2022 / NodeNext)
- **Express.js** como framework web HTTP
- **Zod** para validación estricta de esquemas
- **Vitest** y **Supertest** para suite de pruebas automatizadas
- **JWT** para compatibilidad con la autenticación del ecosistema Centavo

---

## 📡 Endpoints de la API

### Health Check
- `GET /health` -> `{ status: "ok", service: "notifications-service" }`

### Procesamiento de Eventos de Transacción
- `POST /api/notifications/events/transaction`
  - Recibe el evento de una nueva transacción, evalúa contra el presupuesto y genera la alerta correspondiente si amerita.
  - **Payload de ejemplo**:
    ```json
    {
      "transactionId": "txn_123",
      "amount": 250,
      "type": "EXPENSE",
      "category": "Alimentación"
    }
    ```
  - **Respuesta con Alerta Generada (201)**:
    ```json
    {
      "alertGenerated": true,
      "notification": {
        "id": "notif_...",
        "userId": "usr_demo123",
        "type": "BUDGET_EXCEEDED",
        "title": "¡Alerta de sobregasto en Alimentación!",
        "message": "Has superado tu presupuesto en la categoría 'Alimentación'...",
        "category": "Alimentación",
        "channel": "IN_APP",
        "read": false
      },
      "budgetComparison": {
        "category": "Alimentación",
        "limitAmount": 500,
        "totalSpent": 550,
        "percentageUsed": 110,
        "isOverBudget": true,
        "excessAmount": 50
      }
    }
    ```

### Historial de Notificaciones
- `GET /api/notifications` -> Lista de notificaciones del usuario autenticado.
- `GET /api/notifications/:id` -> Detalle de una notificación por ID.
- `PATCH /api/notifications/:id/read` -> Marcar notificación como leída.

---

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Ejecutar pruebas unitarias y de integración
npm test

# Compilar para producción
npm run build

# Iniciar servidor compilado
npm start
```
