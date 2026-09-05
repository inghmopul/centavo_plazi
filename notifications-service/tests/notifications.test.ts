import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { InMemoryNotificationRepository } from '../src/repositories/inMemoryNotificationRepository.js';
import { IBudgetsClient } from '../src/clients/budgetsClient.js';
import { BudgetInfo } from '../src/types/notification.types.js';

class MockBudgetsClient implements IBudgetsClient {
  private budgets: BudgetInfo[] = [
    {
      id: 'bdg_1',
      userId: 'usr_demo123',
      category: 'Alimentación',
      limitAmount: 500,
      period: 'MONTHLY'
    },
    {
      id: 'bdg_2',
      userId: 'usr_demo123',
      category: 'Transporte',
      limitAmount: 100,
      period: 'MONTHLY'
    }
  ];

  private spentMap: Record<string, number> = {
    'alimentación': 350,
    'transporte': 90
  };

  async getBudgetsByUser(userId: string): Promise<BudgetInfo[]> {
    return this.budgets.filter(b => b.userId === userId);
  }

  async getBudgetByCategory(userId: string, category: string): Promise<BudgetInfo | null> {
    const found = this.budgets.find(
      b => b.userId === userId && b.category.toLowerCase() === category.toLowerCase()
    );
    return found || null;
  }

  async calculateSpentByCategory(userId: string, category: string): Promise<number> {
    return this.spentMap[category.toLowerCase()] || 0;
  }
}

describe('Notifications Service Endpoints', () => {
  let app: any;
  let repository: InMemoryNotificationRepository;
  let budgetsClient: MockBudgetsClient;

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    budgetsClient = new MockBudgetsClient();
    const setup = createApp({
      notificationRepository: repository,
      budgetsClient
    });
    app = setup.app;
  });

  describe('GET /health', () => {
    it('debe responder con estado ok y el nombre del microservicio', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'notifications-service' });
    });
  });

  describe('POST /api/notifications/events/transaction', () => {
    it('debe generar alerta de sobregasto (BUDGET_EXCEEDED) cuando la transacción excede el presupuesto', async () => {
      // En el mock: Alimentación tiene límite de 500 y gasto previo de 350.
      // Un nuevo gasto de 200 eleva el total a 550 (supera el límite de 500).
      const payload = {
        transactionId: 'txn_001',
        amount: 200,
        type: 'EXPENSE',
        category: 'Alimentación'
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.alertGenerated).toBe(true);
      expect(res.body.notification).toBeDefined();
      expect(res.body.notification.type).toBe('BUDGET_EXCEEDED');
      expect(res.body.notification.category).toBe('Alimentación');
      expect(res.body.budgetComparison.isOverBudget).toBe(true);
      expect(res.body.budgetComparison.totalSpent).toBe(550);
      expect(res.body.budgetComparison.excessAmount).toBe(50);
    });

    it('debe generar advertencia (BUDGET_WARNING) si supera el 80% sin exceder el presupuesto', async () => {
      // Transporte: límite 100, gasto previo 90. Nuevo gasto de 5 -> total 95 (95% <= 100%)
      const payload = {
        transactionId: 'txn_002',
        amount: 5,
        type: 'EXPENSE',
        category: 'Transporte'
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.alertGenerated).toBe(true);
      expect(res.body.notification.type).toBe('BUDGET_WARNING');
      expect(res.body.budgetComparison.isOverBudget).toBe(false);
      expect(res.body.budgetComparison.percentageUsed).toBe(95);
    });

    it('no debe generar alerta si el gasto no supera el umbral de advertencia (<80%)', async () => {
      // Alimentación: límite 500, gasto previo 350. Nuevo gasto de 10 -> total 360 (72%)
      const payload = {
        transactionId: 'txn_003',
        amount: 10,
        type: 'EXPENSE',
        category: 'Alimentación'
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.alertGenerated).toBe(false);
      expect(res.body.reason).toContain('no supera el umbral de alerta');
      expect(res.body.budgetComparison.percentageUsed).toBe(72);
    });

    it('no debe generar alerta si la transacción es un ingreso (INCOME)', async () => {
      const payload = {
        transactionId: 'txn_004',
        amount: 1000,
        type: 'INCOME',
        category: 'Salario'
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.alertGenerated).toBe(false);
      expect(res.body.reason).toContain('Los ingresos no generan alertas');
    });

    it('no debe generar alerta si no existe presupuesto registrado para la categoría', async () => {
      const payload = {
        transactionId: 'txn_005',
        amount: 80,
        type: 'EXPENSE',
        category: 'Mascotas'
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.alertGenerated).toBe(false);
      expect(res.body.reason).toContain('No existe un presupuesto configurado');
    });

    it('debe responder 400 si faltan campos obligatorios en el evento', async () => {
      const payload = {
        amount: -20,
        category: ''
      };

      const res = await request(app)
        .post('/api/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/notifications y gestión de historial', () => {
    it('debe listar las notificaciones generadas para el usuario', async () => {
      // Disparamos una alerta
      await request(app)
        .post('/api/notifications/events/transaction')
        .send({
          transactionId: 'txn_010',
          amount: 300,
          type: 'EXPENSE',
          category: 'Alimentación'
        });

      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].category).toBe('Alimentación');
      expect(res.body[0].read).toBe(false);
    });

    it('debe permitir marcar una notificación como leída', async () => {
      const eventRes = await request(app)
        .post('/api/notifications/events/transaction')
        .send({
          transactionId: 'txn_011',
          amount: 300,
          type: 'EXPENSE',
          category: 'Alimentación'
        });

      const notifId = eventRes.body.notification.id;

      const patchRes = await request(app).patch(`/api/notifications/${notifId}/read`);
      expect(patchRes.status).toBe(200);

      const getRes = await request(app).get(`/api/notifications/${notifId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.read).toBe(true);
    });
  });
});
