import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const { app, authService } = createApp();

// Sembrar usuario demo de desarrollo
authService.register({
  name: 'Usuario Demo',
  email: 'demo@centavo.app',
  password: 'centavo123'
}).catch(() => {
  // Usuario ya existente si se reinicia
});

app.listen(config.port, () => {
  logger.info(`Servidor auth-service iniciado en el puerto ${config.port}`);
  logger.info(`Ambiente: ${config.nodeEnv}`);
});
