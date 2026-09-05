# Budgets Service 📊

Microservicio dedicado a la definición, control y seguimiento de presupuestos para **Centavo**.

## Responsabilidades
- Creación y consulta de presupuestos por categoría y período (semanal, mensual, anual, personalizado).
- Base para el cálculo en tiempo real del porcentaje de presupuesto ejecutado frente a transacciones.
- Monitoreo de umbrales límite para detección de sobregastos.

## Arquitectura y Estructura
```text
budgets-service/
├── .env                     # Configuración de variables de entorno
├── .env.example             # Plantilla de variables de entorno
├── package.json             # Scripts y dependencias
├── tsconfig.json            # Configuración de TypeScript (ESM)
├── tests/
│   └── budgets.test.ts      # Pruebas automatizadas (Vitest + Supertest)
└── src/
    ├── app.ts               # Configuración de Express y middlewares
    ├── index.ts             # Punto de entrada y listener de servidor
    ├── config/
    │   └── env.ts           # Variables de entorno tipadas
    ├── middlewares/
    │   └── authMiddleware.ts# Validación JWT y contexto de usuario
    ├── types/
    │   └── budget.types.ts  # Tipos de dominio e interfaces
    ├── repositories/
    │   ├── budgetRepository.interface.ts # Contrato del repositorio
    │   └── inMemoryBudgetRepository.ts   # Persistencia en memoria
    └── modules/
        └── budgets/
            ├── budgets.schemas.ts        # Validaciones con Zod
            ├── budgets.service.ts        # Lógica de negocio
            ├── budgets.controller.ts     # Controlador HTTP
            └── budgets.routes.ts         # Definición de rutas Express
```

## Endpoints de la API

Prefijos soportados: `/api/budgets` y `/budgets`.

### 1. Monitoreo
- **GET** `/health`
  - Respuesta: `200 OK`
  - Payload: `{ "status": "ok", "service": "budgets-service" }`

### 2. Crear Presupuesto
- **POST** `/api/budgets`
  - Headers: `Authorization: Bearer <token>` (opcional en desarrollo, usa `usr_demo123`)
  - Body (JSON):
    ```json
    {
      "category": "Alimentación",
      "limitAmount": 600,
      "period": "MONTHLY"
    }
    ```
    *Nota: `period` acepta `"WEEKLY"`, `"MONTHLY"`, `"YEARLY"`, `"CUSTOM"`, o en español `"semanal"`, `"mensual"`.*
  - Respuesta: `201 Created`

### 3. Consultar Presupuestos
- **GET** `/api/budgets`
  - Query Params opcionales:
    - `?category=Alimentacion`
    - `?period=MONTHLY`
  - Respuesta: `200 OK` (Array de presupuestos ordenados de más reciente a más antiguo)

### 4. Consultar Presupuesto por ID
- **GET** `/api/budgets/:id`
  - Respuesta: `200 OK` si existe, `404 Not Found` si no existe.

### 5. Eliminar Presupuesto
- **DELETE** `/api/budgets/:id`
  - Respuesta: `200 OK` si fue eliminado, `404 Not Found` si no existe o no pertenece al usuario.

## Comandos Disponibles

- `npm run dev`: Inicia el servicio en modo desarrollo con recarga en caliente vía `tsx`.
- `npm run build`: Compila el código TypeScript a JavaScript en la carpeta `dist/`.
- `npm run start`: Inicia el servicio compilado en `dist/index.js`.
- `npm test`: Ejecuta las pruebas automatizadas con `vitest`.
