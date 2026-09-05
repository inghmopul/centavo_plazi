import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { InMemoryBudgetRepository } from '../src/repositories/inMemoryBudgetRepository.js';

describe('Budgets Service Endpoints', () => {
  let app: any;
  let repository: InMemoryBudgetRepository;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    const setup = createApp({ budgetRepository: repository });
    app = setup.app;
  });

  describe('GET /health', () => {
    it('debe responder status ok y el nombre del microservicio', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'budgets-service' });
    });
  });

  describe('POST /api/budgets', () => {
    it('debe crear un presupuesto correctamente con categoria, monto límite y periodo', async () => {
      const payload = {
        category: 'Alimentación',
        limitAmount: 500,
        period: 'MONTHLY'
      };

      const res = await request(app)
        .post('/api/budgets')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.category).toBe('Alimentación');
      expect(res.body.limitAmount).toBe(500);
      expect(res.body.period).toBe('MONTHLY');
      expect(res.body.userId).toBe('usr_demo123');
    });

    it('debe aceptar periodos en español como "mensual" o "semanal"', async () => {
      const payload = {
        category: 'Transporte',
        limitAmount: 150,
        period: 'semanal'
      };

      const res = await request(app)
        .post('/api/budgets')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.period).toBe('WEEKLY');
    });

    it('debe retornar 400 si falta la categoría o el monto límite es inválido', async () => {
      const payload = {
        category: '',
        limitAmount: -10,
        period: 'MONTHLY'
      };

      const res = await request(app)
        .post('/api/budgets')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/budgets', () => {
    it('debe retornar la lista de presupuestos del usuario', async () => {
      await request(app)
        .post('/api/budgets')
        .send({ category: 'Ocio', limitAmount: 200, period: 'MONTHLY' });

      await request(app)
        .post('/api/budgets')
        .send({ category: 'Servicios', limitAmount: 300, period: 'MONTHLY' });

      const res = await request(app).get('/api/budgets');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].category).toBe('Servicios');
      expect(res.body[1].category).toBe('Ocio');
    });

    it('debe permitir filtrar presupuestos por categoría', async () => {
      await request(app)
        .post('/api/budgets')
        .send({ category: 'Salud', limitAmount: 400, period: 'MONTHLY' });

      await request(app)
        .post('/api/budgets')
        .send({ category: 'Educación', limitAmount: 600, period: 'MONTHLY' });

      const res = await request(app).get('/api/budgets?category=Salud');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].category).toBe('Salud');
    });
  });

  describe('GET /api/budgets/:id', () => {
    it('debe retornar un presupuesto por su ID', async () => {
      const created = await request(app)
        .post('/api/budgets')
        .send({ category: 'Hogar', limitAmount: 800, period: 'MONTHLY' });

      const budgetId = created.body.id;

      const res = await request(app).get(`/api/budgets/${budgetId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(budgetId);
      expect(res.body.category).toBe('Hogar');
    });

    it('debe retornar 404 si el presupuesto no existe', async () => {
      const res = await request(app).get('/api/budgets/bdg_inexistente');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });
});
